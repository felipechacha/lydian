import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    minLength: 2,
    maxLength: 100,
    example: 'Felipe Chacha',
    description: 'Nome público do músico.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  display_name?: string;

  @ApiPropertyOptional({
    format: 'uri',
    example: 'https://example.com/avatar.webp',
    description: 'URL pública ou assinada do avatar.',
  })
  @IsUrl({ require_protocol: true })
  @IsOptional()
  avatar_url?: string;

  @ApiPropertyOptional({
    maxLength: 100,
    example: 'Guitarra',
    description: 'Instrumento principal do usuário.',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  main_instrument?: string;

  @ApiPropertyOptional({
    maxLength: 50,
    example: 'intermediate',
    description: 'Nível de experiência informado pelo usuário.',
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  experience_level?: string;
}
