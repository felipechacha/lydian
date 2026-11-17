import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingProofSection } from './landing-proof-section';

describe('LandingProofSection', () => {
  let component: LandingProofSection;
  let fixture: ComponentFixture<LandingProofSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingProofSection],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingProofSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
