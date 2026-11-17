import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentAchievements } from './recent-achievements';

describe('RecentAchievements', () => {
  let component: RecentAchievements;
  let fixture: ComponentFixture<RecentAchievements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentAchievements],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentAchievements);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('achievements', [
      { label: 'Precisão Harmônica', icon: 'equalizer', tone: 'secondary' },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
