import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSetlistPanel } from './create-setlist-panel';

describe('CreateSetlistPanel', () => {
  let component: CreateSetlistPanel;
  let fixture: ComponentFixture<CreateSetlistPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSetlistPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSetlistPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
