import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProfileStat } from '../../models/profile.models';

@Component({
  selector: 'app-profile-stat-card',
  imports: [],
  templateUrl: './profile-stat-card.html',
  styleUrl: './profile-stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileStatCard {
  @Input({ required: true }) stat!: ProfileStat;

  get toneClass(): string {
    return `profile-stat-card-custom profile-stat-card-custom--${this.stat.tone}`;
  }
}
