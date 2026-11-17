import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-content-skeleton-loading',
  imports: [],
  templateUrl: './content-skeleton-loading.html',
  styleUrl: './content-skeleton-loading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentSkeletonLoading {
  readonly label = input('Carregando conteúdo');
}
