import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

@Injectable()
export class SupabaseAdminClient {
  private readonly logger = new Logger(SupabaseAdminClient.name);
  private clientInstance: SupabaseClient<Database>;

  constructor(private configService: ConfigService) {}

  createAuthClient(): SupabaseClient<Database> {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) throw new Error('Supabase configuration incomplete');
    return createClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  getClient(): SupabaseClient<Database> {
    if (this.clientInstance) {
      return this.clientInstance;
    }

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      this.logger.error('Supabase URL or Service Role Key missing');
      throw new Error('Supabase configuration incomplete');
    }

    this.logger.log('Initializing Supabase ADMIN client...');
    this.clientInstance = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    return this.clientInstance;
  }
}
