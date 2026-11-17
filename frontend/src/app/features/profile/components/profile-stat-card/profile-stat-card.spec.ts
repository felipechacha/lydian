import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileStatCard } from './profile-stat-card';

describe('ProfileStatCard', () => {
  let component: ProfileStatCard;
  let fixture: ComponentFixture<ProfileStatCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileStatCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileStatCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('stat', {
      label: 'Tempo Total de Prática',
      value: '420',
      unit: 'hrs',
      icon: 'timer',
      highlight: '+12%',
      highlightLabel: 'esta semana',
      tone: 'primary',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
