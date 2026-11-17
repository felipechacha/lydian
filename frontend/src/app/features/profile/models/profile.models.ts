export type ProfileAccentTone = 'primary' | 'secondary' | 'tertiary' | 'neutral';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';

export interface UserProfileResponse {
  readonly id: string;
  readonly email: string;
  readonly display_name: string | null;
  readonly avatar_url: string | null;
  readonly main_instrument: string | null;
  readonly experience_level: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface UserProfileDataResponse {
  readonly data: UserProfileResponse;
}

export interface UpdateUserProfileRequest {
  readonly display_name?: string;
  readonly avatar_url?: string;
  readonly main_instrument?: string;
  readonly experience_level?: ExperienceLevel | string;
}

export interface MusicianProfile {
  readonly name: string;
  readonly role: string;
  readonly membershipDays: number;
  readonly level: number;
  readonly badges: readonly string[];
  readonly isVerified: boolean;
  readonly avatarUrl: string;
}

export interface ProfileStat {
  readonly label: string;
  readonly value: string;
  readonly unit: string;
  readonly icon: string;
  readonly highlight: string;
  readonly highlightLabel: string;
  readonly tone: ProfileAccentTone;
}

export interface SkillMetric {
  readonly label: string;
  readonly value: number;
  readonly position: 'top' | 'top-right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'top-left';
}

export interface TrainingMetric {
  readonly label: string;
  readonly value: number;
  readonly tone: ProfileAccentTone;
}

export interface AchievementPreview {
  readonly label: string;
  readonly icon: string;
  readonly tone: ProfileAccentTone;
  readonly isLocked?: boolean;
}

export interface ProfileAchievement {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly tone: ProfileAccentTone;
}
