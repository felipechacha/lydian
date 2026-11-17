import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPage } from './landing-page';

describe('LandingPage', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should present the product features that are currently available', () => {
    const content = fixture.nativeElement.textContent;

    expect(content).toContain('Biblioteca, prática e palco');
    expect(content).toContain('Metrônomo integrado');
    expect(content).toContain('Histórico por música');
    expect(content).toContain('Stage Mode');
  });

  it('should not advertise product capabilities that are not implemented', () => {
    const content = fixture.nativeElement.textContent;

    expect(content).not.toContain('retomada sugerida');
    expect(content).not.toContain('Índice de fluxo');
    expect(content).not.toContain('Prontidão do show');
    expect(content).not.toContain('Lançamento versão 2.0');
  });

  it('should show faithful mockups for library, setlists, and stage mode', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.library-demo-result')).toHaveLength(3);
    expect(element.querySelectorAll('.setlist-demo-track')).toHaveLength(4);
    expect(element.querySelector('.stage-demo-paper')).toBeTruthy();
    expect(element.textContent).toContain('Adicionar à Biblioteca');
    expect(element.textContent).toContain('Adicionar música');
    expect(element.textContent).toContain('Marcar tocada');
  });

  it('should render the three product plans using the current subscription offer', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.landing-plan-card')).toHaveLength(3);
    expect(element.textContent).toContain('Free');
    expect(element.textContent).toContain('R$ 24,90');
    expect(element.textContent).toContain('R$ 479,00');
  });

  it('should compose the landing page from section components', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-landing-hero-section')).toBeTruthy();
    expect(element.querySelector('app-landing-about-section')).toBeTruthy();
    expect(element.querySelector('app-landing-methodology-section')).toBeTruthy();
    expect(element.querySelector('app-landing-experience-section')).toBeTruthy();
    expect(element.querySelector('app-landing-product-showcase-section')).toBeTruthy();
    expect(element.querySelector('app-landing-features-section')).toBeTruthy();
    expect(element.querySelector('app-landing-proof-section')).toBeTruthy();
    expect(element.querySelector('app-landing-plans-section')).toBeTruthy();
    expect(element.querySelector('app-landing-faq-section')).toBeTruthy();
    expect(element.querySelector('app-landing-waitlist-section')).toBeTruthy();
    expect(element.querySelector('app-landing-cta-section')).toBeTruthy();
    expect(element.querySelector('app-landing-footer')).toBeTruthy();
  });
});
