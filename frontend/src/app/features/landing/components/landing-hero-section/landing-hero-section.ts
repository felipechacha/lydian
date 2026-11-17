import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-hero-section',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './landing-hero-section.html',
  styleUrl: './landing-hero-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeroSection {
  readonly navigationMenuOpen = input(false);
  readonly navigationMenuToggle = output<void>();
  readonly sectionNavigate = output<string>();
  readonly shareRequested = output<void>();

  public navigateToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    this.sectionNavigate.emit(sectionId);
  }

  public toggleNavigationMenu(): void {
    this.navigationMenuToggle.emit();
  }

  public shareLandingPage(): void {
    this.shareRequested.emit();
  }
}
