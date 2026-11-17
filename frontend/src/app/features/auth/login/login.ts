import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { ApiRequestError } from '../../../core/http/api-request.error';
import { SeoService } from '../../../core/seo/seo.service';
import { ToastrNotificationService } from '../../../core/notifications/toastr-notification.service';

type LoginForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);
  private readonly _destroying$ = new Subject<void>();

  private _isLoading = false;
  private _submissionError = '';
  private readonly _accountCreated =
    this._activatedRoute.snapshot.queryParamMap.get('accountCreated') === 'true';
  private readonly _loginForm: LoginForm;

  constructor(private seoService: SeoService) {
    this._loginForm = this._initLoginForm();
  }

  ngOnInit(): void {
    this.seoService.updateSeo({
      title: 'Login - Lydian',
      description: 'Faça login na sua conta Lydian para acessar seus recursos.',
    });

    this._checkSessionBeforeLogin();

  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  get loginForm(): LoginForm {
    return this._loginForm;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get submissionError(): string {
    return this._submissionError;
  }

  get accountCreated(): boolean {
    return this._accountCreated;
  }

  public onLogin(): void {
    if (this._loginForm.invalid) {
      this._loginForm.markAllAsTouched();
      return;
    }

    this._isLoading = true;
    this._submissionError = '';
    const { email, password } = this._loginForm.getRawValue();

    this._authService
      .signIn(email, password)
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: () => {
          this._toastrNotificationService.success('Sua sessão foi iniciada.', 'Login realizado');
          void this._router.navigate(['/home']);
        },
        error: (error: unknown) => {
          this._submissionError = this._getErrorMessage(error);
          this._toastrNotificationService.error(this._submissionError, 'Falha no login');
          this._isLoading = false;
        },
        complete: () => {
          this._isLoading = false;
        },
      });
  }

  private _initLoginForm(): LoginForm {
    return this._formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  private _getErrorMessage(error: unknown): string {
    if (error instanceof ApiRequestError) {
      return error.statusCode === 401 ? 'E-mail ou senha inválidos.' : error.message;
    }

    return 'Não foi possível entrar. Tente novamente.';
  }

  private _checkSessionBeforeLogin(): void {
    this._authService
      .checkUserLogged()
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: () => {
          void this._router.navigate(['/home']);
        },
        error: (error: unknown) => {
          console.warn('User is not logged in.');
          if (!(error instanceof ApiRequestError) || error.statusCode !== 401) {
            this._toastrNotificationService.error(
              'Não foi possível verificar sua sessão.',
              'Falha de autenticação',
            );
          }
        },
      });
  }
}
