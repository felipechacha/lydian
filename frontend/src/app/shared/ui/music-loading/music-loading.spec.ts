import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicLoading } from './music-loading';

describe('MusicLoading', () => {
  let component: MusicLoading;
  let fixture: ComponentFixture<MusicLoading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicLoading],
    }).compileComponents();

    fixture = TestBed.createComponent(MusicLoading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose an accessible musical loading state', () => {
    const loadingStatus = fixture.nativeElement.querySelector('[role="status"]');
    const waveBars = fixture.nativeElement.querySelectorAll(
      '.music-loading-minimal-wave-custom > span',
    );

    expect(loadingStatus.getAttribute('aria-label')).toContain('Preparando seu estúdio');
    expect(waveBars.length).toBe(11);
  });

  it('should use the configured wave size', () => {
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();

    const wave = fixture.nativeElement.querySelector('.music-loading-minimal-wave-custom');

    expect(wave.classList).toContain('music-loading-minimal-wave-custom--large');
  });
});
