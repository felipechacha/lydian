import { OmitType, PartialType } from '@nestjs/swagger';
import { AddPracticeSongDto } from './add-practice-song.dto';

export class UpdatePracticeSongDto extends PartialType(
  OmitType(AddPracticeSongDto, ['song_id'] as const),
) {}
