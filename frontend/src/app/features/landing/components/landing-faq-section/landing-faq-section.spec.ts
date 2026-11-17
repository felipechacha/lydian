import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingFaqSection } from './landing-faq-section';

describe('LandingFaqSection', () => {
  let component: LandingFaqSection;
  let fixture: ComponentFixture<LandingFaqSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingFaqSection],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingFaqSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
