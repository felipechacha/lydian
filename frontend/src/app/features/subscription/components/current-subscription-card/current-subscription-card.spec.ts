import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentSubscriptionCard } from './current-subscription-card';
import { CurrentSubscriptionSummary } from '../../models/subscription-plan.models';

describe('CurrentSubscriptionCard', () => {
  let component: CurrentSubscriptionCard;
  let fixture: ComponentFixture<CurrentSubscriptionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentSubscriptionCard],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentSubscriptionCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('subscription', createSubscription());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the current plan status and usage', () => {
    const content = fixture.nativeElement.textContent;

    expect(content).toContain('Free');
    expect(content).toContain('Ativo');
    expect(content).toContain('Limite de 20 músicas');
  });

  function createSubscription(): CurrentSubscriptionSummary {
    return {
      planName: 'Free',
      statusLabel: 'Ativo',
      priceLabel: 'R$ 0/mês',
      description: 'Seu plano para começar a organizar a prática.',
      usageLabel: 'Limite de 20 músicas na biblioteca',
    };
  }
});
