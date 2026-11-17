import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button, ButtonVariant } from '../../../../shared/ui/button/button';
import { SubscriptionPlan, SubscriptionPlanId } from '../../models/subscription-plan.models';

@Component({
  selector: 'app-subscription-plan-card',
  imports: [Button],
  templateUrl: './subscription-plan-card.html',
  styleUrl: './subscription-plan-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionPlanCard {
  readonly plan = input.required<SubscriptionPlan>();
  readonly planSelected = output<SubscriptionPlanId>();

  public applyCardClass(): string {
    const plan = this.plan();
    const recommendedClass = plan.isRecommended
      ? ' subscription-plan-card-custom--recommended'
      : '';

    return `subscription-plan-card-custom subscription-plan-card-custom--${plan.tone}${recommendedClass}`;
  }

  public applyButtonVariant(): ButtonVariant {
    if (this.plan().tone === 'secondary') {
      return 'secondary';
    }

    if (this.plan().tone === 'neutral') {
      return 'ghost';
    }

    return 'primary';
  }

  public selectPlan(): void {
    this.planSelected.emit(this.plan().id);
  }
}
