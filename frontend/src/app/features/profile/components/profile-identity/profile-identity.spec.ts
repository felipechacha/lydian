import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileIdentity } from './profile-identity';

describe('ProfileIdentity', () => {
  let component: ProfileIdentity;
  let fixture: ComponentFixture<ProfileIdentity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileIdentity],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileIdentity);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('profile', {
      name: 'Alex Morgan',
      role: 'Violonista Intermediário',
      membershipDays: 142,
      level: 14,
      badges: ['Pro', 'Virtuoso'],
      isVerified: true,
      avatarUrl: 'https://example.com/avatar.jpg',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
