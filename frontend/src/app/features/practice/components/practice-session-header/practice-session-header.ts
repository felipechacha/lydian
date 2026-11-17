import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-practice-session-header',
  imports: [RouterLink],
  templateUrl: './practice-session-header.html',
  styleUrl: './practice-session-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeSessionHeader {
  @Input() elapsedTime = '00:00:00';
  @Input() isTimerRunning = false;
  @Input() sessionStatusLabel = 'Sessão pronta';
  @Output() readonly timerToggled = new EventEmitter<void>();
}
