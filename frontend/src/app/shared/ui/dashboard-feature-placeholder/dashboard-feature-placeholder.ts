import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface DashboardFeaturePlaceholderContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly status: string;
  readonly highlights: readonly string[];
  readonly actionLabel: string;
  readonly actionRoute: string;
}

@Component({
  selector: 'app-dashboard-feature-placeholder',
  imports: [RouterLink],
  templateUrl: './dashboard-feature-placeholder.html',
  styleUrl: './dashboard-feature-placeholder.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardFeaturePlaceholder {
  @Input({ required: true }) content!: DashboardFeaturePlaceholderContent;
}
