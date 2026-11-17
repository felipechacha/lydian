import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62',
  })
  id: string;

  @ApiProperty({ format: 'email', example: 'musico@example.com' })
  email: string;

  @ApiProperty({ example: 'Felipe Chacha', nullable: true })
  display_name: string | null;

  @ApiProperty({
    format: 'uri',
    example: 'https://example.com/avatar.webp',
    nullable: true,
  })
  avatar_url: string | null;

  @ApiProperty({ example: 'Guitarra', nullable: true })
  main_instrument: string | null;

  @ApiProperty({ example: 'intermediate', nullable: true })
  experience_level: string | null;

  @ApiProperty({ format: 'date-time', example: '2026-07-28T12:00:00.000Z' })
  created_at: string;

  @ApiProperty({ format: 'date-time', example: '2026-07-28T12:00:00.000Z' })
  updated_at: string;
}
