import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PracticeGoalDataResponse,
  UpdatePracticeGoalRequest,
} from '../models/practice-goal.models';

@Injectable({
  providedIn: 'root',
})
export class PracticeGoalService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _practiceGoalApiUrl = `${environment.apiUrl}/me/practice-goal`;

  public getPracticeGoal(): Observable<PracticeGoalDataResponse> {
    return this._httpClient.get<PracticeGoalDataResponse>(this._practiceGoalApiUrl);
  }

  public updatePracticeGoal(
    payload: UpdatePracticeGoalRequest,
  ): Observable<PracticeGoalDataResponse> {
    return this._httpClient.patch<PracticeGoalDataResponse>(this._practiceGoalApiUrl, payload);
  }
}
