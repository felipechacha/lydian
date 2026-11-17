import { BrowserPlatformLocation, PlatformLocation, Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiRequestError } from '../../../core/http/api-request.error';
import { ResetPassword } from './reset-password';

describe('ResetPassword', () => {
  let component: ResetPassword;
  let fixture: ComponentFixture<ResetPassword>;
  let response$: Subject<unknown>;
  const requestRecovery = vi.fn();
  const completeRecovery = vi.fn();
  const proof = 'a'.repeat(64);

  async function create(confirm = false, url = '/reset-password'): Promise<void> {
    window.history.replaceState({}, '', url);
    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [
        { provide: PlatformLocation, useClass: BrowserPlatformLocation },
        { provide: ActivatedRoute, useValue: { snapshot: { data: { confirm } } } },
        {
          provide: AuthService,
          useValue: { resetPassword: requestRecovery, completePasswordRecovery: completeRecovery },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.clearAllMocks();
    response$ = new Subject();
    requestRecovery.mockReturnValue(response$.asObservable());
    completeRecovery.mockReturnValue(response$.asObservable());
  });

  afterEach(() => window.history.replaceState({}, '', '/'));

  it('should submit email once and display a generic response', async () => {
    await create();
    component.resetForm.setValue({ email: 'musician@example.com' });
    component.onReset();
    component.onReset();
    expect(requestRecovery).toHaveBeenCalledExactlyOnceWith('musician@example.com');
    response$.next({ data: { message: 'Generic response' } });
    response$.complete();
    fixture.detectChanges();
    expect(component.isLoading).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Se houver uma conta');
  });

  it('should capture credentials, clean the URL and require matching passwords', async () => {
    await create(
      true,
      `/reset-password/confirm?recovery_token=${proof}#refresh_token=fixture-refresh&type=recovery&access_token=fixture-access`,
    );
    expect(TestBed.inject(Location).path(true)).toBe('/reset-password/confirm');
    expect(window.location.href).not.toContain('fixture-refresh');
    expect(fixture.nativeElement.innerHTML).not.toContain(proof);
    component.passwordForm.setValue({ password: 'NewPassword123!', confirmPassword: 'Different' });
    component.onConfirm();
    expect(completeRecovery).not.toHaveBeenCalled();
    component.passwordForm.controls.confirmPassword.setValue('NewPassword123!');
    component.onConfirm();
    component.onConfirm();
    expect(completeRecovery).toHaveBeenCalledExactlyOnceWith({
      recovery_token: proof,
      refresh_token: 'fixture-refresh',
      password: 'NewPassword123!',
    });
    response$.next({ data: { message: 'Password updated' } });
    response$.complete();
    fixture.detectChanges();
    expect(component.isSubmitted).toBe(true);
    expect(component.passwordForm.controls.password.value).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Entre novamente');
  });

  it('should reject ordinary sessions without the email-bound recovery proof', async () => {
    await create(true, '/reset-password/confirm#refresh_token=fixture-refresh&type=recovery');
    expect(component.linkError).toContain('inválido');
    component.onConfirm();
    expect(completeRecovery).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('');
  });

  it('should reject duplicated proof parameters', async () => {
    await create(
      true,
      `/reset-password/confirm?recovery_token=${proof}&recovery_token=${proof}#refresh_token=fixture-refresh`,
    );
    expect(component.linkError).toContain('inválido');
  });

  it('should allow a rate-limited request to be retried without storing tokens', async () => {
    await create(
      true,
      `/reset-password/confirm?recovery_token=${proof}#refresh_token=fixture-refresh`,
    );
    component.passwordForm.setValue({
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    });
    component.onConfirm();
    response$.error(new ApiRequestError('Too many requests', 429));
    expect(component.isLoading).toBe(false);
    expect(component.linkError).toBe('');
    const retry$ = new Subject();
    completeRecovery.mockReturnValue(retry$.asObservable());
    component.onConfirm();
    expect(completeRecovery).toHaveBeenCalledTimes(2);
  });

  it('should stop reusing an expired or consumed link', async () => {
    await create(
      true,
      `/reset-password/confirm?recovery_token=${proof}#refresh_token=fixture-refresh`,
    );
    component.passwordForm.setValue({
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    });
    component.onConfirm();
    response$.error(new ApiRequestError('Expired proof', 401));
    component.onConfirm();
    expect(completeRecovery).toHaveBeenCalledOnce();
    expect(component.linkError).toContain('novo link');
  });

  it('should support the prepared custom email template contract', async () => {
    await create(true, '/reset-password/confirm?token_hash=fixture-hash&type=recovery');
    component.passwordForm.setValue({
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    });
    component.onConfirm();
    expect(completeRecovery).toHaveBeenCalledWith({
      token_hash: 'fixture-hash',
      password: 'NewPassword123!',
    });
    expect(window.location.search).toBe('');
  });
});
