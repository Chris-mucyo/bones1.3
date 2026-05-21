import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { prismaService } from '../prisma/prisma.service';
import { CreateConversionDto, SendMessageDto } from './dto/chat.dto';

const userSelect = {
  id: true,
  fullname: true,
  avatar: true,
  shopName: true,
} as const;

@Injectable()
export class ChatService {
  constructor(private readonly)
}