import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { DashboardShell } from './dashboard-shell';

describe('DashboardShell', () => {
  let component: DashboardShell;
  let fixture: ComponentFixture<DashboardShell>;

  beforeEach(async () => {
    window.localStorage.removeItem('lydian.dashboard.sidebar.expanded');

    await TestBed.configureTestingModule({
      imports: [DashboardShell],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => of({ data: { display_name: 'Felipe Costa' } }),
            signOut: () => of({ data: null }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardShell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the sidebar open and closed', () => {
    component.toggleSidebar();
    expect(component.isSidebarOpen).toBe(true);

    component.toggleSidebar();
    expect(component.isSidebarOpen).toBe(false);
  });

  it('should allow the header button to close the sidebar on desktop', () => {
    const innerWidthSpy = vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440);
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    expect(component.isSidebarOpen).toBe(true);
    expect(
      fixture.nativeElement
        .querySelector('.dashboard-workspace-custom')
        .classList.contains('dashboard-workspace-custom--sidebar-open'),
    ).toBe(true);

    const menuButton = fixture.nativeElement.querySelector(
      '.topbar-menu-button-custom',
    ) as HTMLButtonElement;
    menuButton.click();
    fixture.detectChanges();

    expect(component.isSidebarOpen).toBe(false);
    expect(window.localStorage.getItem('lydian.dashboard.sidebar.expanded')).toBe('false');
    expect(
      fixture.nativeElement
        .querySelector('.dashboard-workspace-custom')
        .classList.contains('dashboard-workspace-custom--sidebar-open'),
    ).toBe(false);

    innerWidthSpy.mockRestore();
  });

  it('should preserve the collapsed desktop state after navigation and shell recreation', () => {
    const innerWidthSpy = vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440);
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    component.toggleSidebar();
    component.handleNavigationSelected();

    expect(component.isSidebarOpen).toBe(false);
    expect(window.localStorage.getItem('lydian.dashboard.sidebar.expanded')).toBe('false');

    fixture.destroy();
    fixture = TestBed.createComponent(DashboardShell);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isSidebarOpen).toBe(false);

    innerWidthSpy.mockRestore();
  });

  it('should still close the mobile overlay after selecting a route', () => {
    component.toggleSidebar();
    expect(component.isSidebarOpen).toBe(true);

    component.handleNavigationSelected();

    expect(component.isSidebarOpen).toBe(false);
  });

  it('should close the mobile sidebar with the Escape key handler', () => {
    component.toggleSidebar();

    component.closeSidebarWithKeyboard();

    expect(component.isSidebarOpen).toBe(false);
  });
});
