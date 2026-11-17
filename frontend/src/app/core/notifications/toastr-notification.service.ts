import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ToastrNotificationService {
  private readonly _toastrService = inject(ToastrService, { optional: true });
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  public success(message: string, title = 'Tudo certo'): void {
    if (this._isBrowser) {
      this._toastrService?.success(message, title);
    }
  }

  public error(message: string, title = 'Algo deu errado'): void {
    if (this._isBrowser) {
      this._toastrService?.error(message, title);
    }
  }

  public warning(message: string, title = 'Atenção'): void {
    if (this._isBrowser) {
      this._toastrService?.warning(message, title);
    }
  }

  public info(message: string, title = 'Informação'): void {
    if (this._isBrowser) {
      this._toastrService?.info(message, title);
    }
  }

  public clear(): void {
    if (this._isBrowser) {
      this._toastrService?.clear();
    }
  }
}
