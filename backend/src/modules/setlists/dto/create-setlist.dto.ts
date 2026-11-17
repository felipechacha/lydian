import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSetlistDto {
  @ApiProperty({
    minLength: 1,
    maxLength: 200,
    example: 'Show de sábado',
    description: 'Nome da setlist.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    example: 'Repertório principal da apresentação.',
    description: 'Descrição livre da setlist.',
  })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: ['private', 'public', 'unlisted'],
    default: 'private',
    description: 'Controle de visibilidade da setlist.',
  })
  @IsIn(['private', 'public', 'unlisted'])
  @IsOptional()
  visibility?: 'private' | 'public' | 'unlisted';
}
