import { Module } from '@nestjs/common';
// import { EncryptionService } from './encryption.service';
// import { CloudinaryService } from './cloudinary.service';
import { ErrorHandlerService } from './error-handler.service';

@Module({
  providers: [ErrorHandlerService],
  exports: [ErrorHandlerService],
})
export class CommonModule {}
