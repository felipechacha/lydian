import { ApiProperty } from '@nestjs/swagger';

export class SignedUploadUrlResponseDto {
  @ApiProperty({
    example: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62/avatar/file.webp',
  })
  path: string;

  @ApiProperty({
    format: 'uri',
    example: 'https://project.supabase.co/storage/v1/upload/sign/...',
  })
  signedUrl: string;

  @ApiProperty({ description: 'Token de upload de uso único.' })
  token: string;
}

export class SignedReadUrlResponseDto {
  @ApiProperty({
    format: 'uri',
    example: 'https://project.supabase.co/storage/v1/object/sign/...',
  })
  signedUrl: string;
}
