import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private clientInstance: SupabaseClient<Database>;

  constructor(private configService: ConfigService) {}

  getClient(): SupabaseClient<Database> {
    if (this.clientInstance) {
      return this.clientInstance;
    }

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      this.logger.error('Supabase URL or Anon Key missing');
      throw new Error('Supabase configuration incomplete');
    }

    this.logger.log('Initializing Supabase client (ANON)...');
    this.clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
    return this.clientInstance;
  }
}
