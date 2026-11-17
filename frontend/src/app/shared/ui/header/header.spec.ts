import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
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

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the current page title', () => {
    fixture.componentRef.setInput('pageTitle', 'Biblioteca');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.topbar-title-custom').textContent).toContain(
      'Biblioteca',
    );
  });

  it('should render the current user name and initials from the session', () => {
    expect(fixture.nativeElement.querySelector('.user-name-custom').textContent).toContain(
      'Felipe Costa',
    );
    expect(fixture.nativeElement.querySelector('.user-thumb-circle').textContent).toContain('FC');
  });

  it('should expose the sidebar state and emit its toggle action', () => {
    const sidebarToggleSpy = vi.spyOn(component.sidebarToggle, 'emit');
    fixture.componentRef.setInput('isSidebarOpen', true);
    fixture.detectChanges();

    const menuButton = fixture.nativeElement.querySelector(
      '.topbar-menu-button-custom',
    ) as HTMLButtonElement;
    menuButton.click();

    expect(menuButton.getAttribute('aria-label')).toBe('Alternar menu de navegação');
    expect(
      menuButton.querySelector('.sidebar-toggle-icon-desktop-custom')?.textContent,
    ).toContain('left_panel_close');
    expect(menuButton.querySelector('.sidebar-toggle-icon-mobile-custom')?.textContent).toContain(
      'close',
    );
    expect(sidebarToggleSpy).toHaveBeenCalledOnce();
  });
});
