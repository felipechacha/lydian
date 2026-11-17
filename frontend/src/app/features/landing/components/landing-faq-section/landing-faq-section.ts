import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-landing-faq-section',
  imports: [],
  templateUrl: './landing-faq-section.html',
  styleUrl: './landing-faq-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFaqSection {
  private _activeFaqIndex: number | null = 0;

  public isFaqOpen(index: number): boolean {
    return this._activeFaqIndex === index;
  }

  public toggleFaq(index: number): void {
    this._activeFaqIndex = this._activeFaqIndex === index ? null : index;
  }
}
