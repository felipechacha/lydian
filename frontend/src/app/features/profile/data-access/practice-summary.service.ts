import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PracticeSummaryDataResponse } from '../models/practice-summary.models';

@Injectable({ providedIn: 'root' })
export class PracticeSummaryService {
  private readonly _httpClient = inject(HttpClient);

  public getPracticeSummary(): Observable<PracticeSummaryDataResponse> {
    return this._httpClient.get<PracticeSummaryDataResponse>(
      `${environment.apiUrl}/me/practice-summary`,
    );
  }
}
