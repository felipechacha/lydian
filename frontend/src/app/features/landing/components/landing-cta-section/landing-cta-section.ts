import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-cta-section',
  imports: [RouterLink],
  templateUrl: './landing-cta-section.html',
  styleUrl: './landing-cta-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingCtaSection {}
