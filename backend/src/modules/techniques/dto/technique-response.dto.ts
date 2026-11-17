import { ApiProperty } from '@nestjs/swagger';

export class TechniqueResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ example: 'palm-muting' }) key: string;
  @ApiProperty({ example: 'Palm mute' }) name: string;
  @ApiProperty({ example: 'articulation' }) category: string;
}
