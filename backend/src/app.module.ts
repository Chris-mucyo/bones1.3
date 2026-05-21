import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { MailModule } from './mail/mail.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './auth/guards/role.guard.js';
import { ListingModule } from './listing/listing.module';
import { ChatController } from './chat/chat.controller';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    MailModule,
    ListingModule,
    ChatModule,
  ],
  controllers: [AppController, ChatController],
  providers: [
    AppService,
    // Apply JWT guard globally — use @Public() to opt out
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Apply roles guard globally
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Apply validation globally
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // strip unknown fields
        forbidNonWhitelisted: true,
        transform: true, // auto-transform types (string → number etc.)
      }),
    },
  ],
})
export class AppModule {}
