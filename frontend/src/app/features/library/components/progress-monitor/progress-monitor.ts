import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProgressBar } from '../../models/music-details.models';

@Component({
  selector: 'app-progress-monitor',
  imports: [],
  templateUrl: './progress-monitor.html',
  styleUrl: './progress-monitor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressMonitor {
  @Input() bars: readonly ProgressBar[] = [];
}
