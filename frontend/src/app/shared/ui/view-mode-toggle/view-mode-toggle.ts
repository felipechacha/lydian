import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ContentViewMode = 'grid' | 'list';

@Component({
  selector: 'app-view-mode-toggle',
  imports: [],
  templateUrl: './view-mode-toggle.html',
  styleUrl: './view-mode-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewModeToggle {
  readonly viewMode = input.required<ContentViewMode>();
  readonly viewModeSelected = output<ContentViewMode>();

  public applyViewClass(viewMode: ContentViewMode): string {
    const activeClass = this.viewMode() === viewMode ? ' view-mode-button-custom--active' : '';
    return `view-mode-button-custom${activeClass}`;
  }
}
