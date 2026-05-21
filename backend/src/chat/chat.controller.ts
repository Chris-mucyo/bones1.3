import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto';

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ─── GET /conversations ────────────────────────────────────────────────────
  // Returns all conversations for the logged-in user
  @Get()
  getConversations(@GetUser('id') userId: number) {
    return this.chatService.getConversations(userId);
  }

  // ─── POST /conversations ───────────────────────────────────────────────────
  // Start a new conversation or return existing one
  @Post()
  getOrCreate(
    @GetUser('id') userId: number,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.getOrCreateConversation(userId, dto);
  }

  // ─── GET /conversations/:id/messages ──────────────────────────────────────
  // Returns all messages + marks them as read
  @Get(':id/messages')
  getMessages(
    @Param('id') conversationId: string,
    @GetUser('id') userId: number,
  ) {
    return this.chatService.getMessages(conversationId, userId);
  }

  // ─── POST /conversations/:id/messages ─────────────────────────────────────
  // Send a message in a conversation
  @Post(':id/messages')
  sendMessage(
    @Param('id') conversationId: string,
    @GetUser('id') userId: number,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(conversationId, userId, dto);
  }
}
