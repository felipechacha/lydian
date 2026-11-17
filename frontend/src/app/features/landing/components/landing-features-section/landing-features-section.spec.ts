import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingFeaturesSection } from './landing-features-section';

describe('LandingFeaturesSection', () => {
  let component: LandingFeaturesSection;
  let fixture: ComponentFixture<LandingFeaturesSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingFeaturesSection],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingFeaturesSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
