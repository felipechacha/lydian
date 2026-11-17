import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { Button } from '../button/button';

@Component({
  selector: 'app-confirmation-modal',
  imports: [Button],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModal {
  readonly eyebrow = input('Ação permanente');
  readonly title = input.required<string>();
  readonly subject = input.required<string>();
  readonly description = input.required<string>();
  readonly cancelLabel = input('Manter');
  readonly confirmLabel = input.required<string>();
  readonly loadingLabel = input('Processando ação');
  readonly isProcessing = input(false);
  readonly errorMessage = input('');

  readonly cancelled = output<void>();
  readonly confirmed = output<void>();

  @HostListener('document:keydown.escape')
  public cancel(): void {
    if (!this.isProcessing()) {
      this.cancelled.emit();
    }
  }

  public confirm(): void {
    if (!this.isProcessing()) {
      this.confirmed.emit();
    }
  }
}
