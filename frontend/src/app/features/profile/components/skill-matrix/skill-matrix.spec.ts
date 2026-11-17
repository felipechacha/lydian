import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillMatrix } from './skill-matrix';

describe('SkillMatrix', () => {
  let component: SkillMatrix;
  let fixture: ComponentFixture<SkillMatrix>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillMatrix],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillMatrix);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('skills', [
      { label: 'Velocidade', value: 70, position: 'top' },
      { label: 'Precisão', value: 80, position: 'top-right' },
      { label: 'Teoria', value: 75, position: 'bottom-right' },
      { label: 'Repertório', value: 82, position: 'bottom' },
      { label: 'Ritmo', value: 68, position: 'bottom-left' },
      { label: 'Percepção', value: 72, position: 'top-left' },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate one chart point for each skill', () => {
    expect(component.chartPoints.length).toBe(6);
    expect(component.dataPoints.split(' ').length).toBe(6);
  });
});
