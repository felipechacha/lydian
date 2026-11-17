import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingMethodologySection } from './landing-methodology-section';

describe('LandingMethodologySection', () => {
  let component: LandingMethodologySection;
  let fixture: ComponentFixture<LandingMethodologySection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingMethodologySection],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingMethodologySection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
