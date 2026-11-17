import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListTechniquesQueryDto {
  @ApiPropertyOptional({
    example: 'articulation',
    maxLength: 80,
    description: 'Filtra o catálogo pela categoria da técnica.',
  })
  @IsString()
  @MaxLength(80)
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    example: 'palm',
    maxLength: 100,
    description: 'Busca textual por nome ou chave da técnica.',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  search?: string;
}
