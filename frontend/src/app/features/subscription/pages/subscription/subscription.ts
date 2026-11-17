import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { SeoService } from '../../../../core/seo/seo.service';
import { DashboardShell } from '../../../../shared/ui/dashboard-shell/dashboard-shell';
import { CurrentSubscriptionCard } from '../../components/current-subscription-card/current-subscription-card';
import { SubscriptionPlanCard } from '../../components/subscription-plan-card/subscription-plan-card';
import {
  CurrentSubscriptionSummary,
  SubscriptionPlan,
  SubscriptionPlanId,
} from '../../models/subscription-plan.models';

@Component({
  selector: 'app-subscription',
  imports: [DashboardShell, CurrentSubscriptionCard, SubscriptionPlanCard],
  templateUrl: './subscription.html',
  styleUrl: './subscription.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Subscription implements OnInit {
  private readonly _seoService = inject(SeoService);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);

  private readonly _currentSubscription: CurrentSubscriptionSummary = {
    planName: 'Free',
    statusLabel: 'Ativo',
    priceLabel: 'R$ 0/mês',
    description: 'Seu plano para começar a organizar o repertório e criar uma rotina de prática.',
    usageLabel: 'Limite de 20 músicas na biblioteca',
  };

  private readonly _plans: readonly SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      eyebrow: 'Seu primeiro acorde',
      description:
        'Organize o repertório essencial e transforme pequenos momentos de prática em constância.',
      monthlyPrice: 'R$ 0',
      annualPrice: 'R$ 0',
      annualEquivalent: 'gratuito para sempre',
      annualBenefit: 'Sem cartão',
      features: [
        'Biblioteca com até 20 músicas',
        'Timer de prática e metrônomo',
        'Até 2 setlists ativos',
        'Histórico recente de sessões',
      ],
      ctaLabel: 'Começar grátis',
      icon: 'music_note',
      tone: 'neutral',
    },
    {
      id: 'starter',
      name: 'Starter',
      eyebrow: 'Ritmo consistente',
      description:
        'Para músicos que querem ampliar o repertório, organizar ensaios e acompanhar sua evolução.',
      monthlyPrice: 'R$ 24,90',
      annualPrice: 'R$ 239,00',
      annualEquivalent: 'equivale a R$ 19,92/mês',
      annualBenefit: 'Economize 20%',
      features: [
        'Biblioteca de músicas ilimitada',
        'Sessões e histórico completos',
        'Setlists ilimitados com Stage Mode',
        'Metas e indicadores de progresso',
        'Organização por técnicas e dificuldade',
      ],
      ctaLabel: 'Escolher Starter',
      icon: 'equalizer',
      tone: 'primary',
      isRecommended: true,
    },
    {
      id: 'full',
      name: 'Full',
      eyebrow: 'Performance sem limites',
      description:
        'A experiência completa para quem leva estudo, repertório e preparação de palco a sério.',
      monthlyPrice: 'R$ 49,90',
      annualPrice: 'R$ 479,00',
      annualEquivalent: 'equivale a R$ 39,92/mês',
      annualBenefit: 'Economize 20%',
      features: [
        'Tudo do plano Starter',
        'Análises avançadas de evolução',
        'Planos de estudo personalizados',
        'Backup e exportação do repertório',
        'Acesso antecipado a novas ferramentas',
      ],
      ctaLabel: 'Escolher Full',
      icon: 'graphic_eq',
      tone: 'secondary',
    },
  ];

  public ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Assinatura',
      description: 'Compare os planos do Lydian e escolha a experiência ideal para sua prática.',
      keywords: ['planos Lydian', 'assinatura musical', 'prática musical'],
    });
  }

  get plans(): readonly SubscriptionPlan[] {
    return this._plans;
  }

  get currentSubscription(): CurrentSubscriptionSummary {
    return this._currentSubscription;
  }

  public selectPlan(planId: SubscriptionPlanId): void {
    const selectedPlan = this._plans.find((plan) => plan.id === planId);

    if (!selectedPlan) {
      return;
    }

    this._toastrNotificationService.info(
      `O checkout do plano ${selectedPlan.name} será disponibilizado em breve.`,
      'Próxima etapa',
    );
  }
}
