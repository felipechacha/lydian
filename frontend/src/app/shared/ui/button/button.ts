import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ButtonType = 'button' | 'submit' | 'reset';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  host: {
    '[class.lydian-button-host-custom--full-width]': 'fullWidth()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly type = input<ButtonType>('button');
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('medium');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  readonly ariaLabel = input<string | null>(null);
  readonly loadingLabel = input('Carregando');

  readonly buttonClicked = output<MouseEvent>();

  public applyButtonClass(): string {
    const fullWidthClass = this.fullWidth() ? ' lydian-button-custom--full-width' : '';

    return [
      'lydian-button-custom',
      `lydian-button-custom--${this.variant()}`,
      `lydian-button-custom--${this.size()}`,
      fullWidthClass,
    ]
      .join(' ')
      .trim();
  }

  public isInteractionDisabled(): boolean {
    return this.disabled() || this.loading();
  }

  public showSubmitLoading(): boolean {
    return this.type() === 'submit' && this.loading();
  }

  public handleClick(event: MouseEvent): void {
    this.buttonClicked.emit(event);
  }
}
