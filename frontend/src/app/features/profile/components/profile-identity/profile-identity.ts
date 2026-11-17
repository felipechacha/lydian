import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MusicianProfile } from '../../models/profile.models';

@Component({
  selector: 'app-profile-identity',
  templateUrl: './profile-identity.html',
  styleUrl: './profile-identity.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileIdentity {
  @Input({ required: true }) profile!: MusicianProfile;

  public applyBadgeStyle(index: number): string {
    const tone = index === 0 ? 'primary' : 'secondary';

    return `profile-badge-custom profile-badge-custom--${tone}`;
  }
}
