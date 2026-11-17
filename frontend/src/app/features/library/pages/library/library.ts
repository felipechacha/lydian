import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../../../core/seo/seo.service';
import {
  DashboardFeaturePlaceholder,
  DashboardFeaturePlaceholderContent,
} from '../../../../shared/ui/dashboard-feature-placeholder/dashboard-feature-placeholder';
import { DashboardShell } from '../../../../shared/ui/dashboard-shell/dashboard-shell';

@Component({
  selector: 'app-library',
  imports: [DashboardShell, DashboardFeaturePlaceholder],
  templateUrl: './library.html',
  styleUrl: './library.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Library implements OnInit {
  private readonly _seoService = inject(SeoService);

  private readonly _content: DashboardFeaturePlaceholderContent = {
    eyebrow: 'Seu acervo musical',
    title: 'Sua biblioteca, organizada pela prática.',
    description:
      'A estrutura está pronta para reunir partituras, repertórios e materiais de estudo em uma experiência conectada à sua rotina.',
    icon: 'library_music',
    status: 'Estrutura pronta para receber o repertório',
    highlights: ['Repertório por instrumento', 'Filtros de dificuldade', 'Histórico de estudo'],
    actionLabel: 'Voltar ao painel',
    actionRoute: '/home',
  };

  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Biblioteca',
      description: 'Organize seu repertório e materiais de prática no Lydian.',
      keywords: ['biblioteca musical', 'repertório', 'partituras', 'Lydian'],
    });
  }

  get content(): DashboardFeaturePlaceholderContent {
    return this._content;
  }
}
