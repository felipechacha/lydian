import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseAdminClient } from './supabase-admin.client';

@Module({
  providers: [SupabaseService, SupabaseAdminClient],
  exports: [SupabaseService, SupabaseAdminClient],
})
export class SupabaseModule {}
