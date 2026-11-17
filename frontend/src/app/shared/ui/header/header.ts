import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastrNotificationService } from '../../../core/notifications/toastr-notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnInit, OnDestroy {
  @Input() isSidebarOpen = false;
  @Input() pageTitle = 'Painel';
  @Output() readonly sidebarToggle = new EventEmitter<void>();

  private readonly _authService = inject(AuthService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _router = inject(Router);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);
  private readonly _destroying$ = new Subject<void>();

  private _userName = 'Usuário Lydian';
  private _userThumb = 'LY';
  private _isMenuOpen = false;

  ngOnInit(): void {
    this._loadCurrentUser();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  get userName(): string {
    return this._userName;
  }

  get userThumb(): string {
    return this._userThumb;
  }

  get isMenuOpen(): boolean {
    return this._isMenuOpen;
  }

  public toggleMenu(): void {
    this._isMenuOpen = !this._isMenuOpen;
  }

  public toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  public logout(): void {
    this._authService
      .signOut()
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: () => {
          this._isMenuOpen = false;
          this._toastrNotificationService.success('Sua sessão foi encerrada.', 'Logout realizado');
          void this._router.navigate(['/login']);
        },
        error: (error: unknown) => {
          console.error('Logout error:', error);
          this._toastrNotificationService.error(
            'Não foi possível encerrar sua sessão.',
            'Falha no logout',
          );
        },
        complete: () => {
          this._isMenuOpen = false;
        },
      });
  }

  public navigateToPreferences(): void {
    this._isMenuOpen = false;
    void this._router.navigate(['/profile']);
  }

  private _loadCurrentUser(): void {
    this._authService
      .getCurrentUser()
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: (response: any) => {
          const userData = response?.data ?? response;
          const userName = userData?.display_name?.trim();

          if (userName) {
            this._userName = userName;
            this._userThumb = this._buildUserInitials(userName);
          }

          this._changeDetectorRef.markForCheck();
        },
        error: (error: unknown) => {
          console.error('Error loading header user:', error);
          this._toastrNotificationService.error(
            'Não foi possível carregar os dados do usuário.',
            'Falha no perfil',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  private _buildUserInitials(userName: string): string {
    return userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((namePart) => namePart.charAt(0).toUpperCase())
      .join('');
  }
}
