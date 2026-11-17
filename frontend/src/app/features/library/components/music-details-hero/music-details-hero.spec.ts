import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MusicDetailsHero } from './music-details-hero';
import { LIBRARY_MUSICS } from '../../data-access/music-library.data';

describe('MusicDetailsHero', () => {
  let component: MusicDetailsHero;
  let fixture: ComponentFixture<MusicDetailsHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicDetailsHero],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MusicDetailsHero);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('music', LIBRARY_MUSICS[0]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request deletion without deleting the song directly', () => {
    let deletionWasRequested = false;
    component.deleteRequested.subscribe(() => {
      deletionWasRequested = true;
    });

    const deleteButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('.delete-music-custom');
    deleteButton.click();

    expect(deletionWasRequested).toBe(true);
  });

  it('should disable destructive actions while deletion is pending', () => {
    fixture.componentRef.setInput('isDeleting', true);
    fixture.detectChanges();

    const actionButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
      '.music-hero-actions-custom button',
    );

    expect(Array.from(actionButtons).every((button) => button.disabled)).toBe(true);
  });

  it('should request a practice session setup', () => {
    let practiceWasRequested = false;
    component.practiceRequested.subscribe(() => {
      practiceWasRequested = true;
    });
    const practiceButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('.start-practice-custom');
    practiceButton.click();

    expect(practiceWasRequested).toBe(true);
  });

  it('should offer a direct return to the music library', () => {
    const backLink: HTMLAnchorElement = fixture.nativeElement.querySelector(
      '.music-details-back-custom',
    );

    expect(backLink.textContent).toContain('Voltar à biblioteca');
    expect(backLink.getAttribute('href')).toBe('/musics');
  });
});
