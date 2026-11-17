import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingAboutSection } from './landing-about-section';

describe('LandingAboutSection', () => {
  let component: LandingAboutSection;
  let fixture: ComponentFixture<LandingAboutSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingAboutSection],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingAboutSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
