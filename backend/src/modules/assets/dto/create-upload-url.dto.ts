import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateUploadUrlDto {
  @ApiProperty({
    enum: ['avatar', 'cover'],
    example: 'avatar',
    description: 'Finalidade do arquivo dentro do bucket privado.',
  })
  @IsIn(['avatar', 'cover'])
  type: 'avatar' | 'cover';

  @ApiProperty({
    maxLength: 180,
    example: 'foto-perfil.webp',
    description: 'Nome original; será sanitizado e prefixado com UUID.',
  })
  @IsString()
  @MaxLength(180)
  file_name: string;

  @ApiProperty({
    enum: ['image/jpeg', 'image/png', 'image/webp'],
    example: 'image/webp',
    description: 'MIME type permitido pelo bucket.',
  })
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  content_type: 'image/jpeg' | 'image/png' | 'image/webp';

  @ApiProperty({
    minimum: 1,
    maximum: 10485760,
    example: 524288,
    description: 'Tamanho do arquivo em bytes, limitado a 10 MB.',
  })
  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  size: number;
}
