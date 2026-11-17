import { Injectable } from '@nestjs/common';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import { throwMappedDatabaseError } from '../../../common/database/database-error.mapper';

const ASSETS_BUCKET = 'lydian-assets';

@Injectable()
export class AssetsRepository {
  constructor(private readonly supabaseAdmin: SupabaseAdminClient) {}

  async createUploadUrl(path: string) {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .storage.from(ASSETS_BUCKET)
      .createSignedUploadUrl(path);
    if (error) throwMappedDatabaseError(error);
    return data;
  }

  async createReadUrl(path: string) {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .storage.from(ASSETS_BUCKET)
      .createSignedUrl(path, 10 * 60);
    if (error) throwMappedDatabaseError(error);
    return data;
  }
}
