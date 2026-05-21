import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/chat.dto';

@WebSocketGateway({
  cors: { origin: '*' }, // tighten this to your frontend URL in production
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // userId → Set of socketIds (one user can have multiple tabs)
  private onlineUsers = new Map<number, Set<string>>();

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Connection ───────────────────────────────────────────────────────────

  async handleConnection(socket: Socket) {
    const userId = this.extractUserId(socket);
    if (!userId) return socket.disconnect();

    socket.data.userId = userId;

    // Track online
    if (!this.onlineUsers.has(userId)) this.onlineUsers.set(userId, new Set());
    this.onlineUsers.get(userId)!.add(socket.id);

    // Join all conversation rooms for this user
    const convs = await this.prisma.conversation.findMany({
      where: { OR: [{ userA: userId }, { userB: userId }] },
      select: { id: true },
    });
    convs.forEach((c) => socket.join(`conv:${c.id}`));

    // Broadcast presence to everyone
    this.server.emit('user.online', { userId });
    console.log(`[WS] User ${userId} connected (socket: ${socket.id})`);
  }

  async handleDisconnect(socket: Socket) {
    const userId: number = socket.data.userId;
    if (!userId) return;

    const sockets = this.onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        this.onlineUsers.delete(userId);
        this.server.emit('user.offline', { userId });
      }
    }
    console.log(`[WS] User ${userId} disconnected`);
  }

  // ─── Events ───────────────────────────────────────────────────────────────

  /** Client emits this to send a message */
  @SubscribeMessage('message.send')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    body: { conversationId: string; content: string; type?: string },
  ) {
    const userId: number = socket.data.userId;
    const { conversationId, content, type = 'text' } = body;

    // Validate membership
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv || (conv.userA !== userId && conv.userB !== userId)) {
      throw new WsException('Forbidden');
    }

    const receiverId = conv.userA === userId ? conv.userB : conv.userA;

    // Persist message
    const message = await this.prisma.message.create({
      data: {
        content,
        type: type as any,
        senderId: userId,
        receiverId,
        conversationId,
      },
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date(), unread: { increment: 1 } },
    });

    const formatted = this.formatMessage(message, userId);

    // Emit to everyone in the room (sender gets it back too for confirmation)
    this.server.to(`conv:${conversationId}`).emit('message.new', {
      conversationId,
      message: formatted,
    });

    // If receiver is online in a different conversation, update their sidebar
    this.server.to(`conv:${conversationId}`).emit('conversation.updated', {
      conversationId,
      lastMessage: formatted,
    });

    return formatted; // ack to sender
  }

  /** Client emits this to mark messages as read */
  @SubscribeMessage('messages.read')
  async handleMarkRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { conversationId: string },
  ) {
    const userId: number = socket.data.userId;
    const { conversationId } = body;

    await this.prisma.message.updateMany({
      where: { conversationId, receiverId: userId, read: false },
      data: { read: true },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { unread: 0 },
    });

    // Notify the sender their messages were read
    this.server.to(`conv:${conversationId}`).emit('messages.read', {
      conversationId,
      readBy: userId,
    });
  }

  /** Client emits this when typing */
  @SubscribeMessage('typing.start')
  handleTypingStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { conversationId: string },
  ) {
    socket.to(`conv:${body.conversationId}`).emit('typing.start', {
      conversationId: body.conversationId,
      userId: socket.data.userId,
    });
  }

  @SubscribeMessage('typing.stop')
  handleTypingStop(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { conversationId: string },
  ) {
    socket.to(`conv:${body.conversationId}`).emit('typing.stop', {
      conversationId: body.conversationId,
      userId: socket.data.userId,
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  isOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }

  private extractUserId(socket: Socket): number | null {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) return null;
      const payload = this.jwt.verify(token);
      return payload.sub ?? payload.id ?? null;
    } catch {
      return null;
    }
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
}
