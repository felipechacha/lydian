import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { ApiRequestError } from '../../../core/http/api-request.error';
import { ToastrNotificationService } from '../../../core/notifications/toastr-notification.service';

type RegisterForm = FormGroup<{
  fullName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}>;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnDestroy {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);
  private readonly _destroying$ = new Subject<void>();

  private _isLoading = false;
  private _submissionError = '';
  private readonly _registerForm: RegisterForm;

  constructor() {
    this._registerForm = this._initRegisterForm();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  get registerForm(): RegisterForm {
    return this._registerForm;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get submissionError(): string {
    return this._submissionError;
  }

  public onRegister(): void {
    if (this._registerForm.invalid) {
      this._registerForm.markAllAsTouched();
      return;
    }

    this._isLoading = true;
    this._submissionError = '';
    const { fullName, email, password } = this._registerForm.getRawValue();

    this._authService
      .signUp(fullName, email, password)
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: () => {
          this._toastrNotificationService.success(
            'Sua conta está pronta para o primeiro acesso.',
            'Conta criada',
          );
          void this._router.navigate(['/login'], {
            queryParams: { accountCreated: true },
          });
        },
        error: (error: unknown) => {
          this._submissionError = this._getErrorMessage(error);
          this._toastrNotificationService.error(this._submissionError, 'Falha no cadastro');
          this._isLoading = false;
        },
        complete: () => {
          this._isLoading = false;
        },
      });
  }

  private _initRegisterForm(): RegisterForm {
    return this._formBuilder.nonNullable.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this._passwordMatchValidator },
    );
  }

  private _passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    return control.get('password')?.value === control.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  private _getErrorMessage(error: unknown): string {
    if (error instanceof ApiRequestError) {
      return error.message;
    }

    return 'Não foi possível criar sua conta. Tente novamente.';
  }
}
