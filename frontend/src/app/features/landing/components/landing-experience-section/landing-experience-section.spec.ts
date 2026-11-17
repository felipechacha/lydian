import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingExperienceSection } from './landing-experience-section';

describe('LandingExperienceSection', () => {
  let component: LandingExperienceSection;
  let fixture: ComponentFixture<LandingExperienceSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingExperienceSection],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingExperienceSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
