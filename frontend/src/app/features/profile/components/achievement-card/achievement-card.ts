import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProfileAchievement } from '../../models/profile.models';

@Component({
  selector: 'app-achievement-card',
  imports: [],
  templateUrl: './achievement-card.html',
  styleUrl: './achievement-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementCard {
  @Input({ required: true }) achievement!: ProfileAchievement;

  get toneClass(): string {
    return `achievement-card-custom achievement-card-custom--${this.achievement.tone}`;
  }
}
