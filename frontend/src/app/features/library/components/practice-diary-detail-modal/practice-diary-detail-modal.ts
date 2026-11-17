import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PracticeDiaryEntry } from '../../models/music-details.models';

@Component({
  selector: 'app-practice-diary-detail-modal',
  imports: [],
  templateUrl: './practice-diary-detail-modal.html',
  styleUrl: './practice-diary-detail-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeDiaryDetailModal {
  readonly entry = input.required<PracticeDiaryEntry>();
  readonly closed = output<void>();

  get moodLabel(): string {
    const labels: Readonly<Record<string, string>> = {
      satisfied: 'Satisfeito',
      focused: 'Focado',
      challenged: 'Desafiado',
      tired: 'Cansado',
      motivated: 'Motivado',
      calm: 'Tranquilo',
    };

    const mood = this.entry().mood;
    return mood ? (labels[mood] ?? mood) : 'Não informado';
  }
}
