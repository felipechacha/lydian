import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingIntensity } from './training-intensity';

describe('TrainingIntensity', () => {
  let component: TrainingIntensity;
  let fixture: ComponentFixture<TrainingIntensity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingIntensity],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingIntensity);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('metrics', [
      { label: 'Força dos Dedos', value: 88, tone: 'secondary' },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
