import { ConfigService } from '@nestjs/config';
import { SupabaseAdminClient } from './supabase-admin.client';

describe('Isolated auth clients', () => {
  it('creates distinct SDK instances without replacing the shared database client', () => {
    const config = {
      get: (key: string) =>
        key === 'SUPABASE_URL'
          ? 'https://project.example.test'
          : 'synthetic-service-key',
    };
    const admin = new SupabaseAdminClient(config as unknown as ConfigService);
    const shared = admin.getClient();
    const one = admin.createAuthClient();
    const two = admin.createAuthClient();
    expect(one).not.toBe(two);
    expect(one).not.toBe(shared);
    expect(admin.getClient()).toBe(shared);
  });
});
