import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyPerformance } from './weekly-performance';

describe('WeeklyPerformance', () => {
  let component: WeeklyPerformance;
  let fixture: ComponentFixture<WeeklyPerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyPerformance],
    }).compileComponents();

    fixture = TestBed.createComponent(WeeklyPerformance);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('performance', {
      score: 92,
      variation: 4,
      recommendedFocus: 'Ritmos Síncopados',
      metrics: [{ label: 'Metrônomo Ativo', value: '124 BPM', tone: 'success' }],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map the metric tone to a component class', () => {
    expect(component.applyMetricStyle('primary')).toContain(
      'performance-metric-value-custom--primary',
    );
  });
});
