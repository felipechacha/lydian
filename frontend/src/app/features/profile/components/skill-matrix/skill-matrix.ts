import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SkillMetric } from '../../models/profile.models';

interface SkillChartPoint {
  readonly horizontal: string;
  readonly vertical: string;
}

@Component({
  selector: 'app-skill-matrix',
  imports: [],
  templateUrl: './skill-matrix.html',
  styleUrl: './skill-matrix.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillMatrix {
  @Input({ required: true }) skills!: readonly SkillMetric[];

  private readonly _chartCenter = 100;
  private readonly _chartRadius = 62;

  get chartPoints(): readonly SkillChartPoint[] {
    return this.skills.map((skill, index) => {
      const angle = (-90 + index * 60) * (Math.PI / 180);
      const radius = this._chartRadius * (skill.value / 100);

      return {
        horizontal: (this._chartCenter + Math.cos(angle) * radius).toFixed(2),
        vertical: (this._chartCenter + Math.sin(angle) * radius).toFixed(2),
      };
    });
  }

  get dataPoints(): string {
    return this.chartPoints
      .map((point) => `${point.horizontal},${point.vertical}`)
      .join(' ');
  }

  get accessibilitySummary(): string {
    return this.skills.map((skill) => `${skill.label}: ${skill.value}%`).join(', ');
  }

  public applyLabelStyle(skill: SkillMetric): string {
    return `skill-label-custom skill-label-custom--${skill.position}`;
  }
}
