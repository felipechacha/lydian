import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingWaitlistSection } from './landing-waitlist-section';

describe('LandingWaitlistSection', () => {
  let component: LandingWaitlistSection;
  let fixture: ComponentFixture<LandingWaitlistSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingWaitlistSection],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingWaitlistSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate the email before preparing the waitlist submission', () => {
    component.waitlistForm.controls.email.setValue('email-invalido');
    component.submitWaitlist();

    expect(component.waitlistSubmissionPrepared).toBe(false);

    component.waitlistForm.controls.email.setValue('musico@lydian.app');
    component.submitWaitlist();
    fixture.detectChanges();

    expect(component.waitlistSubmissionPrepared).toBe(true);
    expect(component.waitlistEmail).toBe('musico@lydian.app');
    expect(fixture.nativeElement.querySelector('.waitlist-success')).toBeTruthy();
  });
});
