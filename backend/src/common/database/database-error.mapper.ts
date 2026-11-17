import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export function throwMappedDatabaseError(error: unknown): never {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : undefined;
  if (code === '23505') {
    throw new ConflictException('Resource already exists');
  }
  if (code === '23503') {
    throw new BadRequestException('Referenced resource does not exist');
  }
  if (code === 'P0002') {
    throw new NotFoundException('Resource not found');
  }
  if (code === '22023') {
    throw new BadRequestException('Invalid database parameters');
  }
  if (code === '22007') {
    throw new BadRequestException('Invalid date or time range');
  }
  throw new InternalServerErrorException('Database operation failed');
}
