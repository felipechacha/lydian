export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  main_instrument: string | null;
  experience_level: string | null;
  created_at: string;
  updated_at: string;
}
