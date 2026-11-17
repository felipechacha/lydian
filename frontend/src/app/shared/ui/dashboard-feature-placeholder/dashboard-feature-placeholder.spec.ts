import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFeaturePlaceholder } from './dashboard-feature-placeholder';

describe('DashboardFeaturePlaceholder', () => {
  let component: DashboardFeaturePlaceholder;
  let fixture: ComponentFixture<DashboardFeaturePlaceholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFeaturePlaceholder],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardFeaturePlaceholder);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', {
      eyebrow: 'Recurso',
      title: 'Conteúdo em preparação',
      description: 'Descrição do recurso.',
      icon: 'music_note',
      status: 'Em preparação',
      highlights: ['Primeiro recurso'],
      actionLabel: 'Voltar ao início',
      actionRoute: '/home',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the configured feature content', () => {
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain(
      'Conteúdo em preparação',
    );
    expect(fixture.nativeElement.querySelectorAll('.feature-highlights-custom li').length).toBe(1);
  });
});
