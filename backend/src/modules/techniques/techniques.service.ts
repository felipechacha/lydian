import { BadRequestException, Injectable } from '@nestjs/common';
import type { ListTechniquesQueryDto } from './dto/list-techniques-query.dto';
import { TechniquesRepository } from './repositories/techniques.repository';

@Injectable()
export class TechniquesService {
  constructor(private readonly techniquesRepository: TechniquesRepository) {}

  findAll(query: ListTechniquesQueryDto) {
    return this.techniquesRepository.findAll(query);
  }

  async assertActiveIds(ids: readonly string[]): Promise<void> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) return;
    const count = await this.techniquesRepository.countActiveByIds(uniqueIds);
    if (count !== uniqueIds.length) {
      throw new BadRequestException('One or more techniques are invalid');
    }
  }
}
