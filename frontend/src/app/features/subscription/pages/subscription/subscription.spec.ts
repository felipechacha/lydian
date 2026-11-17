import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Subscription } from './subscription';

describe('Subscription', () => {
  let component: Subscription;
  let fixture: ComponentFixture<Subscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Subscription],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Subscription);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the three subscription plans', () => {
    const cards = fixture.nativeElement.querySelectorAll('app-subscription-plan-card');

    expect(cards.length).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('Free');
    expect(fixture.nativeElement.textContent).toContain('Starter');
    expect(fixture.nativeElement.textContent).toContain('Full');
  });

  it('should keep every page section as a semantic sibling with the Bootstrap grid', () => {
    const sections = fixture.nativeElement.querySelectorAll('#subscription-page > section');

    expect(sections.length).toBe(4);
    expect(fixture.nativeElement.querySelector('#subscription-page section section')).toBeNull();
    sections.forEach((section: HTMLElement) => {
      expect(section.querySelector('.container > .row > [class*="col-12"]')).toBeTruthy();
    });
  });
});
