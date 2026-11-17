import { ChangeDetectionStrategy, Component, Input, output } from '@angular/core';
import { RecentPracticeSession, SessionGradeTone } from '../../models/home.models';

@Component({
  selector: 'app-recent-sessions-card',
  imports: [],
  templateUrl: './recent-sessions-card.html',
  styleUrl: './recent-sessions-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentSessionsCard {
  @Input({ required: true }) sessions!: readonly RecentPracticeSession[];
  readonly musicSelected = output<string>();
  readonly historyRequested = output<void>();

  public applyGradeStyle(tone: SessionGradeTone): string {
    return `session-grade-custom session-grade-custom--${tone}`;
  }
}
