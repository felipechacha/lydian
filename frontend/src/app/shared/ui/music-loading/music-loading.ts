import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
  input,
} from '@angular/core';
import { gsap } from 'gsap';

export type MusicLoadingSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-music-loading',
  imports: [],
  templateUrl: './music-loading.html',
  styleUrl: './music-loading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicLoading implements AfterViewInit, OnDestroy {
  readonly message = input('Preparando seu estúdio');
  readonly detail = input('Sincronizando seus dados de prática');
  readonly size = input<MusicLoadingSize>('medium');

  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _platformId = inject(PLATFORM_ID);
  private _animationContext?: gsap.Context;
  private _animationTimer?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    this._animationTimer = setTimeout(() => this._initializeAnimation(), 0);
  }

  ngOnDestroy(): void {
    if (this._animationTimer) {
      clearTimeout(this._animationTimer);
    }

    this._animationContext?.revert();
  }

  public applyWaveClass(): string {
    return `music-loading-minimal-wave-custom music-loading-minimal-wave-custom--${this.size()}`;
  }

  private _initializeAnimation(): void {
    const host = this._elementRef.nativeElement;

    this._animationContext = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const waveBars = gsap.utils.toArray<HTMLElement>('.music-loading-minimal-wave-custom span');
      const wavePattern = [0.42, 0.7, 0.5, 0.86, 0.58, 1, 0.64, 0.9, 0.48, 0.76, 0.4];

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.music-loading-minimal-wave-custom', {
          autoAlpha: 0,
          duration: 0.45,
          scale: 0.9,
        })
        .from('.music-loading-minimal-copy-custom', {
          autoAlpha: 0,
          duration: 0.38,
          y: 8,
        }, '-=0.18');

      waveBars.forEach((waveBar, index) => {
        gsap.to(waveBar, {
          delay: index * -0.09,
          duration: 0.72 + (index % 4) * 0.08,
          ease: 'sine.inOut',
          opacity: 0.62 + (index % 3) * 0.12,
          repeat: -1,
          scaleY: wavePattern[index],
          transformOrigin: 'center center',
          yoyo: true,
        });
      });

      /*
       * V1 — playhead do console de estúdio preservado para comparação.
       * gsap.to('.music-loading-playhead-custom', {
       *   duration: 2.2,
       *   ease: 'none',
       *   left: '100%',
       *   repeat: -1,
       * });
       */
    }, host);
  }
}
