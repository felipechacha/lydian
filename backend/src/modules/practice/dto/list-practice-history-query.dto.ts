import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ListPracticeSessionsQueryDto } from './list-practice-sessions-query.dto';

export class ListPracticeHistoryQueryDto extends ListPracticeSessionsQueryDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Filtra sessões que contenham a música informada.',
  })
  @IsUUID()
  @IsOptional()
  song_id?: string;

  @ApiPropertyOptional({
    format: 'date-time',
    description: 'Início inclusivo do período consultado.',
  })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    format: 'date-time',
    description: 'Fim inclusivo do período consultado.',
  })
  @IsDateString()
  @IsOptional()
  to?: string;
}
