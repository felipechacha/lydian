import { PartialType } from '@nestjs/swagger';
import { CreatePracticeSessionDto } from './create-practice-session.dto';

export class UpdatePracticeSessionDto extends PartialType(
  CreatePracticeSessionDto,
) {}
