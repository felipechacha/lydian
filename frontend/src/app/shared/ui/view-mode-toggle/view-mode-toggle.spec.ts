import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewModeToggle } from './view-mode-toggle';

describe('ViewModeToggle', () => {
  let component: ViewModeToggle;
  let fixture: ComponentFixture<ViewModeToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewModeToggle],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewModeToggle);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('viewMode', 'grid');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the selected list view', () => {
    const emittedModes: string[] = [];
    component.viewModeSelected.subscribe((viewMode) => emittedModes.push(viewMode));

    const listButton = fixture.nativeElement.querySelector(
      'button[aria-label="Visualizar em lista"]',
    ) as HTMLButtonElement;
    listButton.click();

    expect(emittedModes).toEqual(['list']);
  });
});
