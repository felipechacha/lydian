import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentSessionsCard } from './recent-sessions-card';

describe('RecentSessionsCard', () => {
  let component: RecentSessionsCard;
  let fixture: ComponentFixture<RecentSessionsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentSessionsCard],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentSessionsCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sessions', [
      {
        sessionId: 'session-id',
        songId: 'song-id',
        title: 'Claire de Lune',
        description: 'Debussy • 24m de prática',
        grade: 'A+',
        gradeTone: 'success',
      },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map the grade tone to a component class', () => {
    expect(component.applyGradeStyle('success')).toContain('session-grade-custom--success');
  });

  it('should emit the music identifier when a recent session is clicked', () => {
    const selectedSpy = vi.spyOn(component.musicSelected, 'emit');

    fixture.nativeElement.querySelector('.recent-session-item-custom').click();

    expect(selectedSpy).toHaveBeenCalledWith('song-id');
  });
});
