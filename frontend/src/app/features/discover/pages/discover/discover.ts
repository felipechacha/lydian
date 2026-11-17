import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  InjectionToken,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Subject, delay, of, takeUntil } from 'rxjs';
import { SeoService } from '../../../../core/seo/seo.service';
import { ContentSkeletonLoading } from '../../../../shared/ui/content-skeleton-loading/content-skeleton-loading';
import {
  DashboardFeaturePlaceholder,
  DashboardFeaturePlaceholderContent,
} from '../../../../shared/ui/dashboard-feature-placeholder/dashboard-feature-placeholder';
import { DashboardShell } from '../../../../shared/ui/dashboard-shell/dashboard-shell';

export const DISCOVER_MOCK_LOADING_DELAY = new InjectionToken<number>(
  'DISCOVER_MOCK_LOADING_DELAY',
  { factory: () => 450 },
);

@Component({
  selector: 'app-discover',
  imports: [DashboardShell, ContentSkeletonLoading, DashboardFeaturePlaceholder],
  templateUrl: './discover.html',
  styleUrl: './discover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Discover implements OnInit, OnDestroy {
  private readonly _seoService = inject(SeoService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroySubject = new Subject<void>();
  private readonly _mockRequestDelayInMilliseconds = inject(DISCOVER_MOCK_LOADING_DELAY);
  private _isLoading = false;
  private _content!: DashboardFeaturePlaceholderContent;

  private readonly _mockContent: DashboardFeaturePlaceholderContent = {
    eyebrow: 'Novas possibilidades',
    title: 'Descubra o próximo passo da sua jornada.',
    description:
      'Este espaço vai conectar você a obras, exercícios e caminhos de estudo relevantes para o seu instrumento e momento musical.',
    icon: 'explore',
    status: 'Curadoria inicial em preparação',
    highlights: ['Sugestões personalizadas', 'Trilhas de desenvolvimento', 'Novos desafios'],
    actionLabel: 'Voltar ao painel',
    actionRoute: '/home',
  };

  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Descobrir',
      description: 'Descubra repertórios e trilhas de desenvolvimento musical no Lydian.',
      keywords: ['descobrir música', 'trilhas musicais', 'repertório', 'Lydian'],
    });

    this._loadDiscoverContent();
  }

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get content(): DashboardFeaturePlaceholderContent {
    return this._content;
  }

  private _loadDiscoverContent(): void {
    this._isLoading = true;

    // TODO: substituir este Observable mockado pelo serviço da API de discover.
    of(this._mockContent)
      .pipe(delay(this._mockRequestDelayInMilliseconds), takeUntil(this._destroySubject))
      .subscribe({
        next: (content) => {
          this._content = content;
        },
        error: () => {
          this._isLoading = false;
          console.error('Error loading discover content.');
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isLoading = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }
}
