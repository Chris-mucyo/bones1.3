import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ErrorHandlerService } from './common/error-handler.service';
import { CommonModule } from './common/common.module';


@Module({
  imports: [PrismaModule, AuthModule, UsersModule, CommonModule],
  controllers: [AppController, ],
  providers: [AppService, PrismaService, ErrorHandlerService],
})
export class AppModule {}
