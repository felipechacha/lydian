import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PracticeTechnique } from '../../models/practice-session.models';

@Component({
  selector: 'app-session-summary',
  imports: [],
  templateUrl: './session-summary.html',
  styleUrl: './session-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionSummary {
  @Input() techniques: readonly PracticeTechnique[] = [];
  @Output() readonly techniqueSelected = new EventEmitter<number>();
}
