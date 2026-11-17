import { Injectable } from '@nestjs/common';
import { PracticeSummaryRepository } from './repositories/practice-summary.repository';

@Injectable()
export class PracticeSummaryService {
  constructor(private readonly repository: PracticeSummaryRepository) {}
  getSummary(userId: string) {
    return this.repository.getSummary(userId);
  }
}
