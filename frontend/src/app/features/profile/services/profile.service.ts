import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UpdateUserProfileRequest, UserProfileDataResponse } from '../models/profile.models';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly _profileApiUrl = `${environment.apiUrl}/me`;

  constructor(private readonly _httpClient: HttpClient) {}

  public getProfile(): Observable<UserProfileDataResponse> {
    return this._httpClient.get<UserProfileDataResponse>(this._profileApiUrl);
  }

  public updateProfile(payload: UpdateUserProfileRequest): Observable<UserProfileDataResponse> {
    return this._httpClient.patch<UserProfileDataResponse>(this._profileApiUrl, payload);
  }
}
