import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TrainingMetric } from '../../models/profile.models';

@Component({
  selector: 'app-training-intensity',
  imports: [],
  templateUrl: './training-intensity.html',
  styleUrl: './training-intensity.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingIntensity {
  @Input({ required: true }) metrics!: readonly TrainingMetric[];

  public applyMetricStyle(metric: TrainingMetric): string {
    return `training-metric-custom training-metric-custom--${metric.tone}`;
  }
}
