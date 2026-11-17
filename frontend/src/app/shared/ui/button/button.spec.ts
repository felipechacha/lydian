import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Button } from './button';

@Component({
  imports: [Button],
  template: `
    <app-button
      type="submit"
      variant="secondary"
      size="large"
      [loading]="loading"
      [fullWidth]="fullWidth"
      loadingLabel="Salvando alterações"
      (buttonClicked)="handleButtonClick()"
    >
      Salvar perfil
    </app-button>
  `,
})
class ButtonTestHost {
  loading = false;
  fullWidth = false;
  clickCount = 0;

  handleButtonClick(): void {
    this.clickCount += 1;
  }
}

describe('Button', () => {
  let component: ButtonTestHost;
  let fixture: ComponentFixture<ButtonTestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonTestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonTestHost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply its semantic type and design system options', () => {
    const button = getNativeButton();

    expect(button.type).toBe('submit');
    expect(button.classList.contains('lydian-button-custom--secondary')).toBe(true);
    expect(button.classList.contains('lydian-button-custom--large')).toBe(true);
    expect(button.textContent).toContain('Salvar perfil');
  });

  it('should emit its click event when enabled', () => {
    getNativeButton().click();

    expect(component.clickCount).toBe(1);
  });

  it('should preserve its content width and show the wave while submitting', () => {
    component.loading = true;
    fixture.detectChanges();

    const button = getNativeButton();
    const buttonContent = button.querySelector('.lydian-button-content-custom');
    const waveBars = button.querySelectorAll('.lydian-button-wave-custom > span');

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(buttonContent?.classList.contains('lydian-button-content-custom--hidden')).toBe(true);
    expect(waveBars.length).toBe(7);
    expect(button.textContent).toContain('Salvando alterações');
  });

  it('should support a full-width layout without owning an external grid', () => {
    component.fullWidth = true;
    fixture.detectChanges();

    expect(getNativeButton().classList.contains('lydian-button-custom--full-width')).toBe(true);
    expect(fixture.nativeElement.querySelector('.container, .row, [class*="col-"]')).toBeNull();
  });

  function getNativeButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  }
});
