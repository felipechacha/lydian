import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DISCOVER_MOCK_LOADING_DELAY, Discover } from './discover';

describe('Discover', () => {
  let component: Discover;
  let fixture: ComponentFixture<Discover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Discover],
      providers: [{ provide: DISCOVER_MOCK_LOADING_DELAY, useValue: 0 }],
    }).compileComponents();

    fixture = TestBed.createComponent(Discover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the skeleton while the mocked request is pending', () => {
    expect(component.isLoading).toBe(true);
    expect(fixture.nativeElement.querySelector('app-content-skeleton-loading')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#discover-overview-section')).toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        '#discover-loading-section > .container > .row > .col-12.col-md-12',
      ),
    ).toBeTruthy();
  });

  it('should use the Bootstrap page grid after loading', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(fixture.nativeElement.querySelector('app-content-skeleton-loading')).toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        '#discover-overview-section > .container > .row > .col-12.col-md-10',
      ),
    ).toBeTruthy();
  });
});
