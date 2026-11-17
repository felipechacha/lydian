import { ApiProperty } from '@nestjs/swagger';

export class PracticeGoalResponseDto {
  @ApiProperty({ format: 'uuid' })
  user_id: string;

  @ApiProperty({ example: 3600, minimum: 60, maximum: 86400 })
  daily_target_seconds: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 7 })
  weekly_target_days: number;

  @ApiProperty({ example: 'America/Sao_Paulo' })
  timezone: string;

  @ApiProperty({ format: 'date-time', nullable: true })
  created_at: string | null;

  @ApiProperty({ format: 'date-time', nullable: true })
  updated_at: string | null;
}
