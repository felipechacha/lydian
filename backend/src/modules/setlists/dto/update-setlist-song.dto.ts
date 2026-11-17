import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateSetlistSongDto {
  @ApiPropertyOptional({
    minimum: 0,
    example: 2,
    description: 'Nova posição da música na setlist.',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @ApiPropertyOptional({
    example: 'Reduzir o andamento no final.',
    description: 'Nova nota específica da associação.',
  })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;
}
