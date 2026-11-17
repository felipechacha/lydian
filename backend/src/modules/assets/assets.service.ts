import { ForbiddenException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { AssetsRepository } from './repositories/assets.repository';

@Injectable()
export class AssetsService {
  constructor(private readonly assetsRepository: AssetsRepository) {}

  createUploadUrl(userId: string, dto: CreateUploadUrlDto) {
    const extension = extensionFor(dto.content_type);
    const baseName = dto.file_name
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 80);
    const path = `${userId}/${dto.type}/${randomUUID()}-${baseName}.${extension}`;
    return this.assetsRepository.createUploadUrl(path);
  }

  createReadUrl(userId: string, path: string) {
    if (!path.startsWith(`${userId}/`)) {
      throw new ForbiddenException('Asset does not belong to the current user');
    }
    return this.assetsRepository.createReadUrl(path);
  }
}

function extensionFor(contentType: CreateUploadUrlDto['content_type']): string {
  return { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[
    contentType
  ];
}
