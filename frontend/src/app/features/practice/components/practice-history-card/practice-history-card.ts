import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PracticeSessionHistoryItem } from '../../models/practice-session.models';

@Component({
  selector: 'app-practice-history-card',
  imports: [],
  templateUrl: './practice-history-card.html',
  styleUrl: './practice-history-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeHistoryCard {
  @Input({ required: true }) item!: PracticeSessionHistoryItem;
  @Output() readonly opened = new EventEmitter<string>();

  get primarySongTitle(): string {
    return this.item.session.practice_session_songs[0]?.songs.title ?? 'Sessão sem música';
  }

  get primaryArtist(): string {
    return this.item.session.practice_session_songs[0]?.songs.artist ?? 'Artista não informado';
  }

  get artworkUrl(): string {
    const url = this.item.session.practice_session_songs[0]?.songs.cover_image_url?.trim();
    return url ? url.replace(/^http:\/\//i, 'https://') : '/images/music-cover-placeholder.svg';
  }

  get title(): string {
    return this.item.session.title?.trim() || this.primarySongTitle;
  }

  get duration(): string {
    const seconds =
      this.item.session.duration_seconds ?? (this.item.session.duration_minutes ?? 0) * 60;
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return minutes > 0 ? `${minutes}m ${String(remainder).padStart(2, '0')}s` : `${remainder}s`;
  }

  get practicedAt(): string {
    const date = new Date(this.item.session.started_at);
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
      : 'Data não informada';
  }
}
