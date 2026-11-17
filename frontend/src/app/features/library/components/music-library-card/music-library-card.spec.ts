import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicLibraryCard } from './music-library-card';

describe('MusicLibraryCard', () => {
  let component: MusicLibraryCard;
  let fixture: ComponentFixture<MusicLibraryCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicLibraryCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MusicLibraryCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('music', {
      id: 1,
      title: 'Clair de Lune',
      composer: 'Claude Debussy',
      artworkUrl: 'https://images.example.com/clair-de-lune.jpg',
      bpm: 72,
      difficulty: 'Médio',
      status: 'maintaining',
      durationSeconds: 302,
      targetBpm: 84,
      priority: 3,
      lastPracticedAt: '2026-09-29T12:00:00.000Z',
    });
    fixture.componentRef.setInput('viewMode', 'grid');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render every mapped music field without changing the card structure', () => {
    const card: HTMLElement = fixture.nativeElement;

    expect(card.querySelector('article.music-library-card-custom--grid')).toBeTruthy();
    expect(card.querySelector('h2')?.textContent).toContain('Clair de Lune');
    expect(card.querySelector('.music-card-heading-custom p')?.textContent).toContain(
      'Claude Debussy',
    );
    expect(card.textContent).toContain('72 BPM');
    expect(card.textContent).toContain('Médio');
    expect(card.textContent).toContain('Em manutenção');
    expect(card.textContent).toContain('5:02');
    expect(card.textContent).toContain('84 BPM alvo');
    expect(card.textContent).toContain('Prioridade 3/5');
  });

  it('should replace a failed remote cover with the local artwork fallback', () => {
    const artworkImage = document.createElement('img');
    artworkImage.src = 'https://images.example.com/unavailable.jpg';

    component.handleArtworkError({ target: artworkImage } as unknown as Event);

    expect(artworkImage.dataset['fallbackApplied']).toBe('true');
    expect(artworkImage.getAttribute('src')).toBe('/images/music-cover-placeholder.svg');
  });
});
