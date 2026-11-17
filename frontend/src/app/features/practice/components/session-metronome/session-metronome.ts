import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-session-metronome',
  imports: [],
  templateUrl: './session-metronome.html',
  styleUrl: './session-metronome.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionMetronome {
  @Input() tempo = 144;
  @Input() isRunning = false;
  @Output() readonly tempoChanged = new EventEmitter<number>();
  @Output() readonly playToggled = new EventEmitter<void>();

  public changeTempoBy(offset: number): void {
    this.tempoChanged.emit(this.tempo + offset);
  }

  public updateTempo(event: Event): void {
    this.tempoChanged.emit(Number((event.target as HTMLInputElement).value));
  }
}
