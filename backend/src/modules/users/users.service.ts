import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UpdatePracticeGoalDto } from './dto/update-practice-goal.dto';
import type { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getMe(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User profile not found');
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserProfileDto) {
    await this.getMe(userId);
    return this.usersRepository.update(userId, dto);
  }

  async getPracticeGoal(userId: string) {
    await this.getMe(userId);
    const goal = await this.usersRepository.findPracticeGoal(userId);
    return (
      goal ?? {
        user_id: userId,
        daily_target_seconds: 1800,
        weekly_target_days: 5,
        timezone: 'UTC',
        created_at: null,
        updated_at: null,
      }
    );
  }

  async updatePracticeGoal(userId: string, dto: UpdatePracticeGoalDto) {
    const current = await this.getPracticeGoal(userId);
    if (dto.timezone) assertIanaTimezone(dto.timezone);
    return this.usersRepository.upsertPracticeGoal(userId, {
      daily_target_seconds:
        dto.daily_target_seconds ?? current.daily_target_seconds,
      weekly_target_days: dto.weekly_target_days ?? current.weekly_target_days,
      timezone: dto.timezone ?? current.timezone,
    });
  }
}

function assertIanaTimezone(timezone: string): void {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
  } catch {
    throw new BadRequestException('timezone must be a valid IANA timezone');
  }
}
