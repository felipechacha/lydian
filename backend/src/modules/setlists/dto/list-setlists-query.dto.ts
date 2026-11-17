import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListSetlistsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['created_at', 'updated_at', 'name'],
    default: 'created_at',
    description: 'Campo permitido para ordenação das setlists.',
  })
  @IsIn(['created_at', 'updated_at', 'name'])
  @IsOptional()
  sort_by: 'created_at' | 'updated_at' | 'name' = 'created_at';
}
