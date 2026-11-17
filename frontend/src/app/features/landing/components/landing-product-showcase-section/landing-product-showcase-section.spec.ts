import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingProductShowcaseSection } from './landing-product-showcase-section';

describe('LandingProductShowcaseSection', () => {
  let component: LandingProductShowcaseSection;
  let fixture: ComponentFixture<LandingProductShowcaseSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingProductShowcaseSection],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingProductShowcaseSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
