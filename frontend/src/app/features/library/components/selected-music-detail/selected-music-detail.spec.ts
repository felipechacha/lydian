import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedMusicDetail } from './selected-music-detail';

describe('SelectedMusicDetail', () => {
  let component: SelectedMusicDetail;
  let fixture: ComponentFixture<SelectedMusicDetail>;
  const legatoTechniqueId = '43b336c2-851d-4e0e-9ff2-50bc546024be';
  const palmMuteTechniqueId = 'ff373eed-d5ff-49f0-a0e3-243783494f87';
  const availableTechniques = [
    { id: legatoTechniqueId, key: 'legato', name: 'Legato', category: 'articulation' },
    {
      id: palmMuteTechniqueId,
      key: 'palm-mute',
      name: 'Palm Mute',
      category: 'articulation',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedMusicDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectedMusicDetail);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('music', {
      id: 1571968519,
      title: 'Enter Sandman',
      composer: 'Metallica',
      album: 'Metallica (Remastered)',
      genre: 'Metal',
      artworkUrl: 'https://images.example.com/enter-sandman.jpg',
      bpm: 72,
      key: 'Ré Bemol Maior',
      capo: 0,
      tuning: 'E Standard',
      difficulty: 'Intermediário',
      difficultyLevel: 2,
      techniques: ['Legato'],
      techniqueIds: [legatoTechniqueId],
    });
    fixture.componentRef.setInput('isAdded', false);
    fixture.componentRef.setInput('availableTechniques', availableTechniques);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the selected music editorial metadata', () => {
    const detail: HTMLElement = fixture.nativeElement;

    expect(detail.querySelector('h2')?.textContent).toContain('Enter Sandman');
    expect(detail.querySelector('.selected-music-copy-custom > p')?.textContent).toContain(
      'Metallica',
    );
    expect(detail.querySelector('.selected-music-album-custom')?.textContent).toContain(
      'Metallica (Remastered)',
    );
    expect(detail.querySelector('img')?.getAttribute('alt')).toBe('Capa de Enter Sandman');
    expect(component.musicForm.getRawValue()).toEqual({
      bpm: 72,
      key: 'Ré Bemol Maior',
      genre: 'Metal',
      capo: 0,
      tuning: 'E Standard',
      difficulty: 'Intermediário',
      techniqueIds: [legatoTechniqueId],
    });
  });

  it('should allow editing the song and practice metadata without changing the layout structure', () => {
    component.musicForm.patchValue({
      bpm: 96,
      key: 'Mi menor',
      genre: 'Heavy Metal',
      capo: 2,
      tuning: 'Drop D',
    });
    const difficultButton = fixture.nativeElement.querySelectorAll(
      '.difficulty-option-custom',
    )[2] as HTMLButtonElement;
    difficultButton.click();
    fixture.detectChanges();

    const activeDifficultyBars = fixture.nativeElement.querySelectorAll(
      '.difficulty-meter-custom--active',
    );

    expect(component.musicForm.controls.bpm.value).toBe(96);
    expect(component.musicForm.controls.key.value).toBe('Mi menor');
    expect(component.musicForm.controls.genre.value).toBe('Heavy Metal');
    expect(component.musicForm.controls.capo.value).toBe(2);
    expect(component.musicForm.controls.tuning.value).toBe('Drop D');
    expect(component.selectedDifficultyLevel).toBe(3);
    expect(activeDifficultyBars.length).toBe(3);
  });

  it('should render and update the fully styled difficulty control', () => {
    const difficultyButtons = fixture.nativeElement.querySelectorAll(
      '.difficulty-option-custom',
    ) as NodeListOf<HTMLButtonElement>;

    expect(difficultyButtons.length).toBe(3);
    expect(difficultyButtons[1].getAttribute('aria-checked')).toBe('true');

    difficultyButtons[0].click();
    fixture.detectChanges();

    expect(component.musicForm.controls.difficulty.value).toBe('Fácil');
    expect(component.selectedDifficultyLevel).toBe(1);
    expect(difficultyButtons[0].getAttribute('aria-checked')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('.difficulty-meter-custom--active').length).toBe(
      1,
    );
  });

  it('should update catalog techniques without changing the form structure', () => {
    component.updateSelectedTechniqueIds([legatoTechniqueId, palmMuteTechniqueId]);
    fixture.detectChanges();

    expect(component.selectedTechniqueIds).toEqual([legatoTechniqueId, palmMuteTechniqueId]);
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Excluir técnica Palm Mute"]'),
    ).toBeTruthy();

    component.updateSelectedTechniqueIds([legatoTechniqueId]);

    expect(component.selectedTechniqueIds).toEqual([legatoTechniqueId]);
  });

  it('should require at least one technique before submitting', () => {
    component.updateSelectedTechniqueIds([]);
    fixture.detectChanges();

    const nativeButton = fixture.nativeElement.querySelector(
      'app-button button',
    ) as HTMLButtonElement;

    expect(component.musicForm.controls.techniqueIds.invalid).toBe(true);
    expect(component.musicForm.invalid).toBe(true);
    expect(nativeButton.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Adicione pelo menos uma técnica em foco.');
  });

  it('should emit the selected music with every edited practice metadata field', () => {
    let emittedMusic: unknown;
    component.musicAdded.subscribe((music) => {
      emittedMusic = music;
    });

    component.musicForm.patchValue({
      bpm: 124,
      key: 'Mi menor',
      genre: 'Heavy Metal',
      capo: 2,
      tuning: 'Drop D',
      difficulty: 'Difícil',
    });
    component.updateSelectedTechniqueIds([legatoTechniqueId, palmMuteTechniqueId]);
    fixture.detectChanges();

    const sharedButton = fixture.nativeElement.querySelector('app-button');
    const nativeButton = sharedButton.querySelector('button') as HTMLButtonElement;
    nativeButton.click();

    expect(sharedButton).toBeTruthy();
    expect(nativeButton.type).toBe('submit');
    expect(emittedMusic).toEqual({
      id: 1571968519,
      title: 'Enter Sandman',
      composer: 'Metallica',
      album: 'Metallica (Remastered)',
      genre: 'Heavy Metal',
      artworkUrl: 'https://images.example.com/enter-sandman.jpg',
      bpm: 124,
      key: 'Mi menor',
      capo: 2,
      tuning: 'Drop D',
      difficulty: 'Difícil',
      difficultyLevel: 3,
      techniques: ['Legato', 'Palm Mute'],
      techniqueIds: [legatoTechniqueId, palmMuteTechniqueId],
    });
  });

  it('should show the wave and disable the submit button while adding the music', () => {
    fixture.componentRef.setInput('isAdding', true);
    fixture.detectChanges();

    const nativeButton = fixture.nativeElement.querySelector(
      'app-button button',
    ) as HTMLButtonElement;

    expect(nativeButton.disabled).toBe(true);
    expect(nativeButton.getAttribute('aria-busy')).toBe('true');
    expect(nativeButton.querySelectorAll('.lydian-button-wave-custom > span').length).toBe(7);
  });

  it('should render the API error using the error feedback style', () => {
    fixture.componentRef.setInput('addErrorMessage', 'Essa música já existe na sua biblioteca.');
    fixture.detectChanges();

    const feedback = fixture.nativeElement.querySelector('.selected-music-feedback-custom');

    expect(feedback.textContent).toContain('Essa música já existe na sua biblioteca.');
    expect(feedback.classList).toContain('selected-music-feedback-custom--error');
  });
});
