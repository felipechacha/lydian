import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingHeroSection } from './landing-hero-section';

describe('LandingHeroSection', () => {
  let component: LandingHeroSection;
  let fixture: ComponentFixture<LandingHeroSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingHeroSection],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingHeroSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
