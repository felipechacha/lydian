import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationModal } from './confirmation-modal';

describe('ConfirmationModal', () => {
  let component: ConfirmationModal;
  let fixture: ComponentFixture<ConfirmationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Excluir esta música?');
    fixture.componentRef.setInput('subject', 'Enter Sandman');
    fixture.componentRef.setInput('description', 'será removida da sua biblioteca.');
    fixture.componentRef.setInput('confirmLabel', 'Excluir música');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an accessible confirmation dialog', () => {
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');

    expect(dialog.getAttribute('role')).toBe('alertdialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.textContent).toContain('Enter Sandman');
  });

  it('should emit confirmation only while no request is pending', () => {
    let confirmationCount = 0;
    component.confirmed.subscribe(() => confirmationCount++);

    component.confirm();
    fixture.componentRef.setInput('isProcessing', true);
    component.confirm();

    expect(confirmationCount).toBe(1);
  });

  it('should cancel through the backdrop while no request is pending', () => {
    let cancellationCount = 0;
    component.cancelled.subscribe(() => cancellationCount++);

    const backdrop: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.confirmation-modal-backdrop-custom',
    );
    backdrop.click();

    expect(cancellationCount).toBe(1);
  });
});
