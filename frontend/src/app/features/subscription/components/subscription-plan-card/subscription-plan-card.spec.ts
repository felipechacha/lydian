import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionPlanCard } from './subscription-plan-card';
import { SubscriptionPlan } from '../../models/subscription-plan.models';

describe('SubscriptionPlanCard', () => {
  let component: SubscriptionPlanCard;
  let fixture: ComponentFixture<SubscriptionPlanCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionPlanCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionPlanCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('plan', createPlan());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render monthly, annual and included features', () => {
    const cardText = fixture.nativeElement.textContent;

    expect(cardText).toContain('R$ 24,90');
    expect(cardText).toContain('R$ 239,00');
    expect(cardText).toContain('Biblioteca ilimitada');
  });

  it('should emit the selected plan from the CTA', () => {
    const selectedPlans: string[] = [];
    component.planSelected.subscribe((planId) => selectedPlans.push(planId));

    fixture.nativeElement.querySelector('button').click();

    expect(selectedPlans).toEqual(['starter']);
  });

  function createPlan(): SubscriptionPlan {
    return {
      id: 'starter',
      name: 'Starter',
      eyebrow: 'Ritmo consistente',
      description: 'Plano de teste',
      monthlyPrice: 'R$ 24,90',
      annualPrice: 'R$ 239,00',
      annualEquivalent: 'equivale a R$ 19,92/mês',
      annualBenefit: 'Economize 20%',
      features: ['Biblioteca ilimitada'],
      ctaLabel: 'Escolher Starter',
      icon: 'equalizer',
      tone: 'primary',
      isRecommended: true,
    };
  }
});
