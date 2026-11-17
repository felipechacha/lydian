import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-mini-metronome',
  imports: [],
  templateUrl: './mini-metronome.html',
  styleUrl: './mini-metronome.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniMetronome {
  @Input() tempo = 140;
  @Input() isRunning = false;
  @Output() readonly tempoChanged = new EventEmitter<number>();
  @Output() readonly playToggled = new EventEmitter<void>();

  public updateTempo(event: Event): void {
    this.tempoChanged.emit(Number((event.target as HTMLInputElement).value));
  }
}
