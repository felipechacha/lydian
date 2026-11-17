import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarNavigation } from './sidebar-navigation';

describe('SidebarNavigation', () => {
  let component: SidebarNavigation;
  let fixture: ComponentFixture<SidebarNavigation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarNavigation],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarNavigation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose a route for every navigation item', () => {
    expect(component.navigationItems.map((item) => item.route)).toEqual([
      '/home',
      '/musics',
      '/practice-history',
      '/setlist',
      '/discover',
      '/profile',
      '/subscription',
    ]);
  });

  it('should notify the shell after selecting a navigation item', () => {
    const navigationSpy = vi.spyOn(component.navigationSelected, 'emit');

    component.selectNavigation();

    expect(navigationSpy).toHaveBeenCalledOnce();
  });
});
