import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPlansSection } from './landing-plans-section';

describe('LandingPlansSection', () => {
  let component: LandingPlansSection;
  let fixture: ComponentFixture<LandingPlansSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPlansSection],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPlansSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the current three-plan offer', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.landing-plan-card')).toHaveLength(3);
    expect(element.textContent).toContain('Free');
    expect(element.textContent).toContain('R$ 24,90');
    expect(element.textContent).toContain('R$ 479,00');
  });
});
