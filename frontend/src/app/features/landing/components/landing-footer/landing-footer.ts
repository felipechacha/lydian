import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-footer',
  imports: [RouterLink],
  templateUrl: './landing-footer.html',
  styleUrl: './landing-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooter {
  readonly sectionNavigate = output<string>();

  public navigateToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    this.sectionNavigate.emit(sectionId);
  }
}
