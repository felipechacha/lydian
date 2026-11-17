import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingCtaSection } from './landing-cta-section';

describe('LandingCtaSection', () => {
  let component: LandingCtaSection;
  let fixture: ComponentFixture<LandingCtaSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingCtaSection],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingCtaSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
