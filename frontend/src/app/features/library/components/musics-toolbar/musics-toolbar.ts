import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  ContentViewMode,
  ViewModeToggle,
} from '../../../../shared/ui/view-mode-toggle/view-mode-toggle';
import { MusicFilter, MusicFilterOption } from '../../models/musics.models';

@Component({
  selector: 'app-musics-toolbar',
  imports: [ViewModeToggle],
  templateUrl: './musics-toolbar.html',
  styleUrl: './musics-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicsToolbar {
  readonly activeFilter = input.required<MusicFilter>();
  readonly viewMode = input.required<ContentViewMode>();
  readonly filterSelected = output<MusicFilter>();
  readonly viewModeSelected = output<ContentViewMode>();

  private readonly _filters: readonly MusicFilterOption[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Novas', value: 'new' },
    { label: 'Aprendendo', value: 'learning' },
    { label: 'Em manutenção', value: 'maintaining' },
    { label: 'Dominadas', value: 'mastered' },
    { label: 'Arquivadas', value: 'archived' },
  ];

  get filters(): readonly MusicFilterOption[] {
    return this._filters;
  }

  public applyFilterClass(filter: MusicFilter): string {
    const activeClass = this.activeFilter() === filter ? ' musics-filter-custom--active' : '';
    return `musics-filter-custom${activeClass}`;
  }
}
