import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AchievementPreview } from '../../models/profile.models';

@Component({
  selector: 'app-recent-achievements',
  imports: [],
  templateUrl: './recent-achievements.html',
  styleUrl: './recent-achievements.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentAchievements {
  @Input({ required: true }) achievements!: readonly AchievementPreview[];

  public applyAchievementStyle(achievement: AchievementPreview): string {
    const lockedClass = achievement.isLocked ? ' recent-achievement-custom--locked' : '';

    return `recent-achievement-custom recent-achievement-custom--${achievement.tone}${lockedClass}`;
  }
}
