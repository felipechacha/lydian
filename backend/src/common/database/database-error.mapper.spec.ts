import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { throwMappedDatabaseError } from './database-error.mapper';

describe('throwMappedDatabaseError', () => {
  it.each([
    ['23505', ConflictException],
    ['23503', BadRequestException],
    ['P0002', NotFoundException],
    ['22007', BadRequestException],
    ['unexpected', InternalServerErrorException],
  ])('maps database code %s to a safe HTTP exception', (code, exception) => {
    expect(() => throwMappedDatabaseError({ code })).toThrow(exception);
  });
});
