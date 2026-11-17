import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPreloader } from './landing-preloader';

describe('LandingPreloader', () => {
  let component: LandingPreloader;
  let fixture: ComponentFixture<LandingPreloader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPreloader],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPreloader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
