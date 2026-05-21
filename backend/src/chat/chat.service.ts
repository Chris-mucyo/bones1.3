import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto';

const userSelect = {
  id: true,
  fullName: true,
  avatarUrl: true,
  shopName: true,
} as const;

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── GET /conversations ────────────────────────────────────────────────────

  async getConversations(userId: number) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ userA: userId }, { userB: userId }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        userARel: { select: userSelect },
        userBRel: { select: userSelect },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return {
      conversations: conversations.map((c) =>
        this.formatConversation(c, userId),
      ),
    };
  }

  // ─── GET /conversations/:id/messages ──────────────────────────────────────

  async getMessages(conversationId: string, userId: number) {
    const conv = await this.findConversationOrThrow(conversationId, userId);

    // Mark all received messages as read
    await this.prisma.message.updateMany({
      where: { conversationId: conv.id, receiverId: userId, read: false },
      data: { read: true },
    });

    // Reset unread counter
    await this.prisma.conversation.update({
      where: { id: conv.id },
      data: { unread: 0 },
    });

    const messages = await this.prisma.message.findMany({
      where: { conversationId: conv.id },
      orderBy: { createdAt: 'asc' },
    });

    return { messages: messages.map((m) => this.formatMessage(m, userId)) };
  }

  // ─── POST /conversations/:id/messages ─────────────────────────────────────

  async sendMessage(
    conversationId: string,
    userId: number,
    dto: SendMessageDto,
  ) {
    const conv = await this.findConversationOrThrow(conversationId, userId);

    const receiverId = conv.userA === userId ? conv.userB : conv.userA;

    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        type: dto.type ?? 'text',
        senderId: userId,
        receiverId,
        conversationId: conv.id,
      },
    });

    // Bump conversation + increment unread for receiver
    await this.prisma.conversation.update({
      where: { id: conv.id },
      data: {
        updatedAt: new Date(),
        unread: { increment: 1 },
      },
    });

    return this.formatMessage(message, userId);
  }

  // ─── POST /conversations ───────────────────────────────────────────────────

  async getOrCreateConversation(userId: number, dto: CreateConversationDto) {
    const { receiverId } = dto;

    if (userId === receiverId) {
      throw new BadRequestException(
        'Cannot start a conversation with yourself',
      );
    }

    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
      select: userSelect,
    });
    if (!receiver) throw new NotFoundException('User not found');

    // Always keep lower id as userA for the unique constraint
    const [userA, userB] =
      userId < receiverId ? [userId, receiverId] : [receiverId, userId];

    const existing = await this.prisma.conversation.findUnique({
      where: { userA_userB: { userA, userB } },
      include: {
        userARel: { select: userSelect },
        userBRel: { select: userSelect },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (existing) return this.formatConversation(existing, userId);

    const created = await this.prisma.conversation.create({
      data: {
        userA,
        userB,
        participants: [String(userA), String(userB)],
      },
      include: {
        userARel: { select: userSelect },
        userBRel: { select: userSelect },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return this.formatConversation(created, userId);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async findConversationOrThrow(id: string, userId: number) {
    const conv = await this.prisma.conversation.findUnique({ where: { id } });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.userA !== userId && conv.userB !== userId) {
      throw new ForbiddenException('You are not part of this conversation');
    }
    return conv;
  }

  private formatConversation(conv: any, userId: number) {
    const otherUser = conv.userA === userId ? conv.userBRel : conv.userARel;
    const lastMessage = conv.messages?.[0] ?? null;

    return {
      id: conv.id,
      participants: conv.participants,
      otherUser: {
        id: String(otherUser.id),
        name: otherUser.fullName, // schema: fullName → frontend expects: name
        avatar: otherUser.avatarUrl ?? '',
        shopName: otherUser.shopName ?? '',
        online: false, // extend later with a presence/socket system
      },
      lastMessage: lastMessage ? this.formatMessage(lastMessage, userId) : null,
      unreadCount: conv.unread ?? 0, // schema: "unread" → frontend expects: "unreadCount"
      updatedAt: this.relativeTime(conv.updatedAt),
    };
  }

  private formatMessage(msg: any, userId: number) {
    return {
      id: msg.id,
      senderId: msg.senderId === userId ? 'me' : String(msg.senderId),
      receiverId: String(msg.receiverId),
      content: msg.content,
      type: msg.type,
      read: msg.read,
      createdAt: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }

  private relativeTime(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return new Date(date).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  }
}
