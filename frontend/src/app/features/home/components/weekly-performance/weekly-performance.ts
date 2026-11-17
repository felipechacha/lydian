import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PerformanceMetricTone, WeeklyPerformanceSummary } from '../../models/home.models';

@Component({
  selector: 'app-weekly-performance',
  imports: [],
  templateUrl: './weekly-performance.html',
  styleUrl: './weekly-performance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyPerformance {
  @Input({ required: true }) performance!: WeeklyPerformanceSummary;

  get variationLabel(): string {
    const variation = this.performance.variation;
    return variation === null
      ? 'Sem comparação anterior'
      : `${variation > 0 ? '+' : ''}${variation}% de tempo vs última semana`;
  }

  public applyMetricStyle(tone: PerformanceMetricTone): string {
    return `performance-metric-value-custom performance-metric-value-custom--${tone}`;
  }
}
