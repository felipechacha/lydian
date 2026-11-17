import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class UpdateSongTechniquesDto {
  @ApiProperty({
    type: String,
    isArray: true,
    format: 'uuid',
    maxItems: 20,
    description:
      'Lista completa de técnicas associadas à música. Uma lista vazia remove todas.',
  })
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  technique_ids: string[];
}
