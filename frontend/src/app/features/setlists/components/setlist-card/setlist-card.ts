import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentViewMode } from '../../../../shared/ui/view-mode-toggle/view-mode-toggle';
import { SetlistSummary } from '../../models/setlist.models';

@Component({
  selector: 'app-setlist-card',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './setlist-card.html',
  styleUrl: './setlist-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetlistCard {
  private readonly _artworkFallbackUrl = '/images/music-cover-placeholder.svg';

  readonly setlist = input.required<SetlistSummary<string | number>>();
  readonly viewMode = input.required<ContentViewMode>();

  public applyCardClass(): string {
    return `setlist-card-custom setlist-card-custom--${this.viewMode()}`;
  }

  public handleArtworkError(event: Event): void {
    const artworkImage = event.target as HTMLImageElement | null;
    if (!artworkImage || artworkImage.dataset['fallbackApplied'] === 'true') {
      return;
    }

    artworkImage.dataset['fallbackApplied'] = 'true';
    artworkImage.src = this._artworkFallbackUrl;
  }
}
