import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { Header } from '../header/header';
import { SidebarNavigation } from '../sidebar-navigation/sidebar-navigation';

@Component({
  selector: 'app-dashboard-shell',
  imports: [Header, SidebarNavigation],
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardShell implements OnInit {
  @Input() pageTitle = 'Painel';

  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _desktopBreakpoint = 1200;
  private readonly _desktopSidebarStorageKey = 'lydian.dashboard.sidebar.expanded';
  private _isSidebarOpen = false;
  private _isDesktopViewport = false;

  ngOnInit(): void {
    this._synchronizeSidebarWithViewport();
  }

  get isSidebarOpen(): boolean {
    return this._isSidebarOpen;
  }

  public toggleSidebar(): void {
    this._isSidebarOpen = !this._isSidebarOpen;
    this._persistDesktopSidebarPreference();
  }

  public closeSidebar(): void {
    this._isSidebarOpen = false;
    this._persistDesktopSidebarPreference();
  }

  public handleNavigationSelected(): void {
    if (!this._isDesktopViewport) {
      this.closeSidebar();
    }
  }

  @HostListener('window:resize')
  public handleViewportResize(): void {
    this._synchronizeSidebarWithViewport();
  }

  @HostListener('document:keydown.escape')
  public closeSidebarWithKeyboard(): void {
    if (this._isSidebarOpen) {
      this.closeSidebar();
    }
  }

  private _synchronizeSidebarWithViewport(): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    const isDesktopViewport = window.innerWidth >= this._desktopBreakpoint;

    if (isDesktopViewport !== this._isDesktopViewport) {
      this._isDesktopViewport = isDesktopViewport;
      this._isSidebarOpen = isDesktopViewport
        ? this._readDesktopSidebarPreference()
        : false;
    }
  }

  private _readDesktopSidebarPreference(): boolean {
    try {
      const storedPreference = window.localStorage.getItem(this._desktopSidebarStorageKey);

      return storedPreference === null ? true : storedPreference === 'true';
    } catch {
      return true;
    }
  }

  private _persistDesktopSidebarPreference(): void {
    if (!isPlatformBrowser(this._platformId) || !this._isDesktopViewport) {
      return;
    }

    try {
      window.localStorage.setItem(
        this._desktopSidebarStorageKey,
        String(this._isSidebarOpen),
      );
    } catch {
      // A navegação continua funcional mesmo quando o storage não está disponível.
    }
  }
}
