import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  output,
  PLATFORM_ID,
} from '@angular/core';
import { gsap } from 'gsap';

import { animateLandingWave } from '../../utils/landing-wave-animation';

@Component({
  selector: 'app-landing-preloader',
  standalone: true,
  templateUrl: './landing-preloader.html',
  styleUrl: './landing-preloader.scss',
})
export class LandingPreloader implements AfterViewInit, OnDestroy {
  public readonly finished = output<void>();
  public readonly revealReady = output<void>();

  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _platformId = inject(PLATFORM_ID);

  private _animationContext?: ReturnType<typeof gsap.context>;
  private _exitTimeline?: ReturnType<typeof gsap.timeline>;
  private _finishTimeout?: ReturnType<typeof setTimeout>;
  private _safetyTimeout?: ReturnType<typeof setTimeout>;
  private _loadHandler?: () => void;
  private _previousBodyOverflow = '';
  private _startedAt = 0;
  private _exitScheduled = false;
  private _hasFinished = false;
  private _isScrollLocked = false;
  private _prefersReducedMotion = false;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    this._startedAt = performance.now();
    this._prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._lockPageScroll();

    if (!this._prefersReducedMotion) {
      this._initAnimation();
    }

    this._loadHandler = () => this._scheduleExit();

    if (document.readyState === 'complete') {
      this._scheduleExit();
    } else {
      window.addEventListener('load', this._loadHandler, { once: true });
      this._safetyTimeout = setTimeout(() => this._scheduleExit(), 5000);
    }
  }

  ngOnDestroy(): void {
    if (this._loadHandler && isPlatformBrowser(this._platformId)) {
      window.removeEventListener('load', this._loadHandler);
    }

    if (this._finishTimeout) {
      clearTimeout(this._finishTimeout);
    }

    if (this._safetyTimeout) {
      clearTimeout(this._safetyTimeout);
    }

    this._exitTimeline?.kill();
    this._animationContext?.revert();
    this._restorePageScroll();
  }

  private _initAnimation(): void {
    const host = this._elementRef.nativeElement;

    this._animationContext = gsap.context(() => {
      const waveBars = gsap.utils.toArray<HTMLElement>('.landing-preloader__wave i');

      animateLandingWave(waveBars);
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.landing-preloader__brand', { autoAlpha: 0, duration: 0.7, y: 24 })
        .from('.landing-preloader__wave', { autoAlpha: 0, duration: 0.55, scale: 0.86 }, '-=0.35')
        .from('.landing-preloader__copy', { autoAlpha: 0, duration: 0.5, y: 14 }, '-=0.3');
    }, host);
  }

  private _scheduleExit(): void {
    if (this._exitScheduled) {
      return;
    }

    this._exitScheduled = true;

    if (this._safetyTimeout) {
      clearTimeout(this._safetyTimeout);
    }

    const minimumDisplayTime = this._prefersReducedMotion ? 450 : 3000;
    const elapsedTime = performance.now() - this._startedAt;
    const remainingTime = Math.max(0, minimumDisplayTime - elapsedTime);

    this._finishTimeout = setTimeout(() => this._exit(), remainingTime);
  }

  private _exit(): void {
    this.revealReady.emit();

    if (this._prefersReducedMotion) {
      this._complete();
      return;
    }

    const host = this._elementRef.nativeElement;
    const content = host.querySelector<HTMLElement>('.landing-preloader__content');

    this._exitTimeline = gsap
      .timeline({ onComplete: () => this._complete() })
      .to(content, { autoAlpha: 0, duration: 0.36, ease: 'power2.in', scale: 0.96, y: -18 })
      .to(host, { autoAlpha: 0, duration: 0.58, ease: 'power2.inOut' }, '-=0.08');
  }

  private _complete(): void {
    if (this._hasFinished) {
      return;
    }

    this._hasFinished = true;
    const host = this._elementRef.nativeElement;
    host.style.opacity = '0';
    host.style.pointerEvents = 'none';
    host.style.visibility = 'hidden';
    this._restorePageScroll();
    this.finished.emit();
  }

  private _lockPageScroll(): void {
    this._previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this._isScrollLocked = true;
  }

  private _restorePageScroll(): void {
    if (!this._isScrollLocked || !isPlatformBrowser(this._platformId)) {
      return;
    }

    document.body.style.overflow = this._previousBodyOverflow;
    this._isScrollLocked = false;
  }
}
