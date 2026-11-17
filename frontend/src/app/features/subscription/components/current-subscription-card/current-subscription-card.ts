import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrentSubscriptionSummary } from '../../models/subscription-plan.models';

@Component({
  selector: 'app-current-subscription-card',
  imports: [],
  templateUrl: './current-subscription-card.html',
  styleUrl: './current-subscription-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentSubscriptionCard {
  readonly subscription = input.required<CurrentSubscriptionSummary>();
}
