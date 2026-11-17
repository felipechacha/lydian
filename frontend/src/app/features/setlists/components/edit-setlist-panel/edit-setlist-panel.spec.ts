import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSetlistPanel } from './edit-setlist-panel';

describe('EditSetlistPanel', () => {
  let component: EditSetlistPanel;
  let fixture: ComponentFixture<EditSetlistPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSetlistPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSetlistPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
