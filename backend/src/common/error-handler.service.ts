import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

/** Any class that can be instantiated and thrown as an error */
export type ExceptionConstructor = new (...args: unknown[]) => Error;

export interface ErrorHandlerOptions {
  operation?: string;
  knownExceptions?: ExceptionConstructor[];
  prismaErrorMap?: Record<string, string>;
}

/** Shape of a Prisma error's meta object */
interface PrismaErrorMeta {
  target?: string[];
  [key: string]: unknown;
}

@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger(ErrorHandlerService.name);

  handleError(error: unknown, options: ErrorHandlerOptions = {}): never {
    const {
      operation = 'processing request',
      knownExceptions = [
        ConflictException,
        BadRequestException,
        NotFoundException,
      ],
      prismaErrorMap = {},
    } = options;

    if (this.isKnownException(error, knownExceptions)) {
      throw error;
    }

    if (this.isPrismaError(error)) {
      const prismaError = error as { code: string; meta?: PrismaErrorMeta };
      const customMessage = prismaErrorMap[prismaError.code];

      if (customMessage) {
        throw new BadRequestException(customMessage);
      }

      switch (prismaError.code) {
        case 'P2002': {
          const field = prismaError.meta?.target?.[0];
          const fieldName = field ? ` (${field})` : '';
          throw new ConflictException(
            `A record with this information already exists${fieldName}`,
          );
        }

        case 'P2025':
          throw new BadRequestException('The requested record was not found');

        case 'P2003':
          throw new BadRequestException(
            'Cannot perform this operation due to related data',
          );

        case 'P1001':
          this.logger.error(
            `Database connection error during ${operation}:`,
            error,
          );
          throw new InternalServerErrorException(
            'Database connection failed. Please try again later.',
          );

        case 'P2024':
          this.logger.error(`Database timeout during ${operation}:`, error);
          throw new InternalServerErrorException(
            'Database operation timed out. Please try again.',
          );

        default:
          this.logger.error(`Unknown Prisma error during ${operation}:`, error);
          throw new InternalServerErrorException(
            `An unexpected database error occurred while ${operation}. Please try again.`,
          );
      }
    }

    if (this.isNetworkError(error)) {
      this.logger.error(`Network error during ${operation}:`, error);
      throw new InternalServerErrorException(
        'Network connection failed. Please try again later.',
      );
    }

    if (this.isValidationError(error)) {
      throw new BadRequestException('Invalid data provided');
    }

    this.logger.error(`Unexpected error during ${operation}:`, error);
    throw new InternalServerErrorException(
      `An unexpected error occurred while ${operation}. Please try again.`,
    );
  }

  private isKnownException(
    error: unknown,
    knownExceptions: ExceptionConstructor[],
  ): boolean {
    return knownExceptions.some((ExType) => error instanceof ExType);
  }

  private isPrismaError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    if (!('code' in error)) return false;
    const code = (error as { code: unknown }).code;
    return typeof code === 'string' && code.startsWith('P');
  }

  private isNetworkError(error: unknown): boolean {
    if (!(error && typeof error === 'object' && 'message' in error)) {
      return false;
    }
    const msg = (error as Error).message;
    return (
      msg.includes('ENOTFOUND') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('ECONNRESET') ||
      msg.includes('ETIMEDOUT') ||
      msg.includes('ECONNABORTED')
    );
  }

  private isValidationError(error: unknown): boolean {
    return !!(
      error &&
      typeof error === 'object' &&
      'name' in error &&
      (error as { name: unknown }).name === 'ValidationError'
    );
  }
}
