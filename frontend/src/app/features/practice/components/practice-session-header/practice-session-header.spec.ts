import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PracticeSessionHeader } from './practice-session-header';

describe('PracticeSessionHeader', () => {
  let component: PracticeSessionHeader;
  let fixture: ComponentFixture<PracticeSessionHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeSessionHeader],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PracticeSessionHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use the same control to start and pause the session timer', () => {
    let toggleCount = 0;
    component.timerToggled.subscribe(() => {
      toggleCount += 1;
    });

    const timerButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.practice-status-custom button',
    );
    expect(timerButton.getAttribute('aria-label')).toBe('Iniciar timer da sessão');

    timerButton.click();
    expect(toggleCount).toBe(1);

    fixture.componentRef.setInput('isTimerRunning', true);
    fixture.detectChanges();

    expect(timerButton.getAttribute('aria-label')).toBe('Pausar timer da sessão');
    expect(timerButton.textContent).toContain('pause');
  });
});
