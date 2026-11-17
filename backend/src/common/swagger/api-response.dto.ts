import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Invalid request' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['email must be an email'],
      },
    ],
  })
  message: string | string[];

  @ApiProperty({ example: 'BadRequest' })
  error: string;

  @ApiProperty({
    format: 'uuid',
    example: '6e108132-248c-4b2b-92eb-f9f36c1df667',
    required: false,
  })
  requestId?: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1, minimum: 1 })
  page: number;

  @ApiProperty({ example: 20, minimum: 1, maximum: 100 })
  limit: number;

  @ApiProperty({ example: 42, minimum: 0 })
  total: number;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;
}

export class DeletedResourceDto {
  @ApiProperty({
    format: 'uuid',
    example: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62',
  })
  id: string;
}
