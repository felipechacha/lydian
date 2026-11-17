import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, DOCUMENT, Location, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastrNotificationService } from '../../../core/notifications/toastr-notification.service';
import { ApiRequestError } from '../../../core/http/api-request.error';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit, OnDestroy {
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _location = inject(Location);
  private readonly _document = inject(DOCUMENT);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _destroying$ = new Subject<void>();
  private _isLoading = false;
  private _isSubmitted = false;
  private _isConfirmation = false;
  private _linkError = '';
  private _recoveryToken = '';
  private _refreshToken = '';
  private _tokenHash = '';
  private readonly _resetForm = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  private readonly _passwordForm = this._fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: (group) =>
        group.get('password')?.value === group.get('confirmPassword')?.value
          ? null
          : { passwordMismatch: true },
    },
  );

  ngOnInit(): void {
    this._isConfirmation = this._route.snapshot.data['confirm'] === true;
    if (!this._isConfirmation || !this._isBrowser) {
      return;
    }
    const url = new URL(this._document.location.href);
    const fragment = new URLSearchParams(url.hash.slice(1));
    // Keep credentials only in memory and remove the complete query/fragment before rendering.
    this._location.replaceState('/reset-password/confirm');
    const proof = url.searchParams.getAll('recovery_token');
    const refresh = fragment.getAll('refresh_token');
    const tokenHash = url.searchParams.getAll('token_hash');
    if (
      !fragment.has('error') &&
      !fragment.has('error_code') &&
      proof.length === 1 &&
      /^[a-f0-9]{64}$/.test(proof[0]) &&
      refresh.length === 1 &&
      refresh[0]
    ) {
      this._recoveryToken = proof[0];
      this._refreshToken = refresh[0];
    } else if (
      tokenHash.length === 1 &&
      tokenHash[0] &&
      url.searchParams.get('type') === 'recovery' &&
      proof.length === 0
    ) {
      this._tokenHash = tokenHash[0];
    } else {
      this._invalidateLink();
    }
  }

  ngOnDestroy(): void {
    this._clearCredentials();
    this._destroying$.next();
    this._destroying$.complete();
  }

  get resetForm() {
    return this._resetForm;
  }
  get passwordForm() {
    return this._passwordForm;
  }
  get isLoading(): boolean {
    return this._isLoading;
  }
  get isSubmitted(): boolean {
    return this._isSubmitted;
  }
  get isConfirmation(): boolean {
    return this._isConfirmation;
  }
  get linkError(): string {
    return this._linkError;
  }

  public onReset(): void {
    if (this._isLoading) {
      return;
    }
    if (this._resetForm.invalid) {
      this._resetForm.markAllAsTouched();
      return;
    }
    this._isLoading = true;
    this._authService
      .resetPassword(this._resetForm.getRawValue().email.trim())
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: () => {
          this._isSubmitted = true;
        },
        error: (error: unknown) => {
          this._isLoading = false;
          this._toastrNotificationService.error(this._errorMessage(error), 'Falha na recuperação');
        },
        complete: () => {
          this._isLoading = false;
        },
      });
  }

  public onConfirm(): void {
    if (
      this._isLoading ||
      this._linkError ||
      (!this._tokenHash && (!this._recoveryToken || !this._refreshToken))
    ) {
      return;
    }
    if (this._passwordForm.invalid) {
      this._passwordForm.markAllAsTouched();
      return;
    }
    this._isLoading = true;
    const password = this._passwordForm.getRawValue().password;
    const payload = this._tokenHash
      ? { token_hash: this._tokenHash, password }
      : { recovery_token: this._recoveryToken, refresh_token: this._refreshToken, password };
    this._authService
      .completePasswordRecovery(payload)
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: () => {
          this._isSubmitted = true;
          this._clearCredentials();
          this._passwordForm.reset();
        },
        error: (error: unknown) => {
          this._isLoading = false;
          if (error instanceof ApiRequestError) {
            if (error.statusCode === 401) {
              this._invalidateLink();
            }
            if (error.statusCode === 400) {
              this._invalidateLink(
                'A senha não foi aceita. Solicite um novo link e escolha outra senha com 6 a 128 caracteres.',
              );
            }
            if (error.statusCode === 503) {
              this._invalidateLink(
                'Não foi possível confirmar a alteração. Tente entrar com a nova senha ou solicite um novo link.',
              );
            }
          }
          this._toastrNotificationService.error(
            this._errorMessage(error),
            'Falha ao alterar senha',
          );
        },
        complete: () => {
          this._isLoading = false;
        },
      });
  }

  private _errorMessage(error: unknown): string {
    if (error instanceof ApiRequestError) {
      if (error.statusCode === 401) {
        return 'O link expirou ou já foi utilizado. Solicite um novo link.';
      }
      if (error.statusCode === 429) {
        return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      }
      if (error.statusCode === 400) {
        return 'Revise os dados informados. A senha deve ter de 6 a 128 caracteres.';
      }
      if (error.statusCode === 503) {
        return 'O serviço de recuperação está indisponível. Tente novamente mais tarde.';
      }
    }
    return 'Não foi possível concluir a recuperação. Tente novamente.';
  }

  private _invalidateLink(
    message = 'O link é inválido, expirou ou já foi utilizado. Solicite um novo link.',
  ): void {
    this._clearCredentials();
    this._linkError = message;
  }

  private _clearCredentials(): void {
    this._recoveryToken = '';
    this._refreshToken = '';
    this._tokenHash = '';
  }
}
