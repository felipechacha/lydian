import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListPracticeSessionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: [
      'started_at',
      'created_at',
      'duration_seconds',
      'duration_minutes',
      'title',
    ],
    default: 'started_at',
    description: 'Campo permitido para ordenação das sessões.',
  })
  @IsIn([
    'started_at',
    'created_at',
    'duration_seconds',
    'duration_minutes',
    'title',
  ])
  @IsOptional()
  sort_by:
    | 'started_at'
    | 'created_at'
    | 'duration_seconds'
    | 'duration_minutes'
    | 'title' = 'started_at';
}
