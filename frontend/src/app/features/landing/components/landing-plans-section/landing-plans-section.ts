import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';

interface LandingPlan {
  id: 'free' | 'starter' | 'full';
  name: string;
  eyebrow: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  annualEquivalent: string;
  features: readonly string[];
  isRecommended?: boolean;
}

@Component({
  selector: 'app-landing-plans-section',
  imports: [RouterLink],
  templateUrl: './landing-plans-section.html',
  styleUrl: './landing-plans-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPlansSection {
  readonly sectionNavigate = output<string>();

  private readonly _plans: readonly LandingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      eyebrow: 'Seu primeiro acorde',
      description: 'Para começar a organizar seu repertório e construir uma rotina de prática.',
      monthlyPrice: 'R$ 0',
      annualPrice: 'R$ 0',
      annualEquivalent: 'gratuito para sempre',
      features: [
        'Biblioteca com até 20 músicas',
        'Timer de prática e metrônomo',
        'Até 2 setlists ativos',
        'Histórico recente de sessões',
      ],
    },
    {
      id: 'starter',
      name: 'Starter',
      eyebrow: 'Ritmo consistente',
      description: 'Para ampliar o repertório, organizar ensaios e acompanhar sua evolução.',
      monthlyPrice: 'R$ 24,90',
      annualPrice: 'R$ 239,00',
      annualEquivalent: 'equivale a R$ 19,92/mês',
      features: [
        'Biblioteca de músicas ilimitada',
        'Sessões e histórico completos',
        'Setlists ilimitados com Stage Mode',
        'Metas e indicadores de progresso',
        'Organização por técnicas e dificuldade',
      ],
      isRecommended: true,
    },
    {
      id: 'full',
      name: 'Full',
      eyebrow: 'Performance sem limites',
      description: 'A experiência completa para quem leva estudo e preparação de palco a sério.',
      monthlyPrice: 'R$ 49,90',
      annualPrice: 'R$ 479,00',
      annualEquivalent: 'equivale a R$ 39,92/mês',
      features: [
        'Tudo do plano Starter',
        'Análises avançadas de evolução',
        'Planos de estudo personalizados',
        'Backup e exportação do repertório',
        'Acesso antecipado a novas ferramentas',
      ],
    },
  ];

  get plans(): readonly LandingPlan[] {
    return this._plans;
  }

  public navigateToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    this.sectionNavigate.emit(sectionId);
  }
}
