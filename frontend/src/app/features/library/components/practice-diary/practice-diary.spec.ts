import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeDiary } from './practice-diary';

describe('PracticeDiary', () => {
  let component: PracticeDiary;
  let fixture: ComponentFixture<PracticeDiary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeDiary],
    }).compileComponents();

    fixture = TestBed.createComponent(PracticeDiary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the selected entry from its details button', () => {
    const entry = {
      sessionId: 'session-id',
      session: 7,
      title: 'Prática de Enter Sandman',
      date: 'Hoje, 18:12',
      duration: '12 min',
      progress: 80,
      tempo: 72,
      mood: 'satisfied',
      focusArea: 'Palm mute',
      sessionNotes: 'Boa consistência.',
      songNotes: 'Revisar o refrão.',
      accent: 'secondary' as const,
    };
    let selectedEntry: unknown;
    component.entrySelected.subscribe((selected) => (selectedEntry = selected));
    fixture.componentRef.setInput('entries', [entry]);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.diary-entry-custom > button').click();

    expect(selectedEntry).toEqual(entry);
  });
});
