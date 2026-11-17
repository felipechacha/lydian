import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ListTechniquesQuery, TechniquesDataResponse } from '../models/technique.models';

@Injectable({
  providedIn: 'root',
})
export class TechniquesService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _techniquesApiUrl = `${environment.apiUrl}/techniques`;
  private _catalogRequest$?: Observable<TechniquesDataResponse>;

  public getTechniques(query: ListTechniquesQuery = {}): Observable<TechniquesDataResponse> {
    const category = query.category?.trim();
    const search = query.search?.trim();

    if (category || search) {
      return this._httpClient.get<TechniquesDataResponse>(this._techniquesApiUrl, {
        params: {
          ...(category ? { category } : {}),
          ...(search ? { search } : {}),
        },
      });
    }

    if (!this._catalogRequest$) {
      this._catalogRequest$ = this._httpClient
        .get<TechniquesDataResponse>(this._techniquesApiUrl)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }

    return this._catalogRequest$;
  }

  public clearCatalogCache(): void {
    this._catalogRequest$ = undefined;
  }
}
