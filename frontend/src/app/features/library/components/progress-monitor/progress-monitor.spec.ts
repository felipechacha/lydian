import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressMonitor } from './progress-monitor';

describe('ProgressMonitor', () => {
  let component: ProgressMonitor;
  let fixture: ComponentFixture<ProgressMonitor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressMonitor],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressMonitor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
