import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

import { SeoService } from '../../../../core/seo/seo.service';
import { LandingAboutSection } from '../../components/landing-about-section/landing-about-section';
import { LandingCtaSection } from '../../components/landing-cta-section/landing-cta-section';
import { LandingExperienceSection } from '../../components/landing-experience-section/landing-experience-section';
import { LandingFaqSection } from '../../components/landing-faq-section/landing-faq-section';
import { LandingFeaturesSection } from '../../components/landing-features-section/landing-features-section';
import { LandingFooter } from '../../components/landing-footer/landing-footer';
import { LandingHeroSection } from '../../components/landing-hero-section/landing-hero-section';
import { LandingMethodologySection } from '../../components/landing-methodology-section/landing-methodology-section';
import { LandingPlansSection } from '../../components/landing-plans-section/landing-plans-section';
import { LandingPreloader } from '../../components/landing-preloader/landing-preloader';
import { LandingProductShowcaseSection } from '../../components/landing-product-showcase-section/landing-product-showcase-section';
import { LandingProofSection } from '../../components/landing-proof-section/landing-proof-section';
import { LandingWaitlistSection } from '../../components/landing-waitlist-section/landing-waitlist-section';
import { animateLandingWave } from '../../utils/landing-wave-animation';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    LandingAboutSection,
    LandingCtaSection,
    LandingExperienceSection,
    LandingFaqSection,
    LandingFeaturesSection,
    LandingFooter,
    LandingHeroSection,
    LandingMethodologySection,
    LandingPlansSection,
    LandingPreloader,
    LandingProductShowcaseSection,
    LandingProofSection,
    LandingWaitlistSection,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LandingPage implements OnInit, AfterViewInit, OnDestroy {
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _seoService = inject(SeoService);

  private _animationContext?: ReturnType<typeof gsap.context>;
  private _heroTimeline?: ReturnType<typeof gsap.timeline>;
  private _navigationTimeline?: ReturnType<typeof gsap.timeline>;
  private _previousScrollRestoration?: ScrollRestoration;
  private readonly _interactionCleanup: Array<() => void> = [];
  private _animationsInitialized = false;
  private _isNavigationMenuOpen = false;
  private _isPreloading = true;
  private _viewInitialized = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this._platformId)) {
      this._previousScrollRestoration = history.scrollRestoration;
      history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }

    this._seoService.updateSeo({
      title: 'Biblioteca, prática e setlists para músicos',
      description:
        'Organize sua biblioteca, pratique com timer e metrônomo, prepare setlists e conheça os planos do Lydian.',
      keywords: [
        'prática musical',
        'biblioteca musical',
        'setlists',
        'metrônomo',
        'planos Lydian',
        'Lydian',
      ],
    });
  }

  ngAfterViewInit(): void {
    this._viewInitialized = true;

    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    window.scrollTo(0, 0);

    if (this._isPreloading) {
      return;
    }

    this._initLandingAnimations();
    this._heroTimeline?.play(0);
  }

  public onPreloaderRevealReady(): void {
    if (!isPlatformBrowser(this._platformId) || !this._viewInitialized) {
      return;
    }

    window.scrollTo(0, 0);
    this._initLandingAnimations();
  }

  public onPreloaderFinished(): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    this._isPreloading = false;

    if (this._viewInitialized) {
      this._initLandingAnimations();
      this._heroTimeline?.play(0);
    }
  }

  private _initLandingAnimations(): void {
    if (this._animationsInitialized) {
      return;
    }

    this._animationsInitialized = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

    this._animationContext = gsap.context(() => {
      this._initNavigationAnimations();
      this._initScrollAnimations();
      this._initProductStoryAnimations();
      this._initProductShowcaseAnimation();
      this._initParallaxEffects();
      ScrollTrigger.refresh();
      this._initHeroAnimation();
    }, this._elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this._animationContext?.revert();

    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    this._interactionCleanup.forEach((cleanup) => cleanup());
    history.scrollRestoration = this._previousScrollRestoration ?? 'auto';
    document.body.style.overflow = '';
  }

  get isNavigationMenuOpen(): boolean {
    return this._isNavigationMenuOpen;
  }

  get isPreloading(): boolean {
    return this._isPreloading;
  }

  @HostListener('document:keydown.escape')
  public closeNavigationMenu(): void {
    if (this._isNavigationMenuOpen) {
      this._setNavigationMenu(false);
    }
  }

  public toggleNavigationMenu(): void {
    this._setNavigationMenu(!this._isNavigationMenuOpen);
  }

  public navigateToSection(sectionId: string): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    this._setNavigationMenu(false);
    gsap.registerPlugin(ScrollToPlugin);
    gsap.to(window, {
      duration: 1.25,
      ease: 'power3.inOut',
      scrollTo: { offsetY: 72, y: `#${sectionId}` },
    });
  }

  public shareLandingPage(): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    const shareData = {
      title: 'Lydian',
      text: 'Organize sua biblioteca, pratique com foco e prepare seus setlists com Lydian.',
      url: window.location.href,
    };

    if (navigator.share) {
      void navigator.share(shareData).catch(() => undefined);
      return;
    }

    void navigator.clipboard?.writeText(shareData.url);
  }

  private _initHeroAnimation(): void {
    gsap.set('.hero-background img', { scale: 1.18 });
    gsap.set('.landing-header', { autoAlpha: 0, y: -40 });
    gsap.set('.release-badge', { autoAlpha: 0, scale: 0.8, y: 35 });
    gsap.set('#landing-title', {
      autoAlpha: 0,
      rotateX: -12,
      scale: 0.9,
      transformOrigin: 'bottom left',
      y: 110,
    });
    gsap.set('.hero-content > p', { autoAlpha: 0, y: 45 });
    gsap.set('.hero-actions', { autoAlpha: 0, scale: 0.94, y: 38 });
    gsap.set('.landing-footer', { autoAlpha: 0, y: 32 });

    this._heroTimeline = gsap.timeline({
      defaults: { duration: 0.9, ease: 'power3.out' },
      paused: true,
    });

    this._heroTimeline
      .to('.hero-background img', { duration: 1.4, scale: 1 })
      .to('.landing-header', { autoAlpha: 1, y: 0 }, '-=1.1')
      .to('.release-badge', { autoAlpha: 1, scale: 1, y: 0 }, '-=0.65')
      .to(
        '#landing-title',
        {
          autoAlpha: 1,
          duration: 1.25,
          rotateX: 0,
          scale: 1,
          transformOrigin: 'bottom left',
          y: 0,
        },
        '-=0.55',
      )
      .to('.hero-content > p', { autoAlpha: 1, y: 0 }, '-=0.72')
      .to('.hero-actions', { autoAlpha: 1, scale: 1, y: 0 }, '-=0.62')
      .to('.landing-footer', { autoAlpha: 1, y: 0 }, '-=0.48');

    gsap.fromTo(
      '.scroll-cue i span',
      { yPercent: -130 },
      { duration: 1.45, ease: 'power2.inOut', repeat: -1, yPercent: 280 },
    );
  }

  private _initNavigationAnimations(): void {
    const landingHeader =
      this._elementRef.nativeElement.querySelector<HTMLElement>('.landing-header');
    const navigationOverlay =
      this._elementRef.nativeElement.querySelector<HTMLElement>('.navigation-overlay');
    const navigationLinks = Array.from(
      this._elementRef.nativeElement.querySelectorAll<HTMLElement>('.navigation-link'),
    );

    if (navigationOverlay) {
      this._navigationTimeline = gsap
        .timeline({ paused: true })
        .to(navigationOverlay, {
          autoAlpha: 1,
          clipPath: 'circle(150% at calc(100% - 5.5rem) 5.5rem)',
          duration: 0.85,
          ease: 'power4.inOut',
        })
        .from('.navigation-overlay__kicker', { autoAlpha: 0, duration: 0.45, y: 18 }, '-=0.35')
        .from(
          '.navigation-overlay__link span',
          { duration: 0.75, stagger: 0.08, yPercent: 125, ease: 'power4.out' },
          '-=0.35',
        )
        .from(
          '.navigation-overlay__link small, .navigation-overlay__footer',
          { autoAlpha: 0, duration: 0.5, stagger: 0.06, y: 16 },
          '-=0.5',
        );

      gsap.to('.navigation-overlay__ambient span', {
        duration: 7,
        ease: 'sine.inOut',
        repeat: -1,
        rotation: 26,
        scale: 1.12,
        stagger: 0.7,
        yoyo: true,
      });
    }

    const navigationSections = [
      { activeId: 'about-section', sectionId: 'about-section' },
      { activeId: 'about-section', sectionId: 'methodology-section' },
      { activeId: 'experience-section', sectionId: 'experience-section' },
      { activeId: 'experience-section', sectionId: 'product-showcase-section' },
      { activeId: 'features-section', sectionId: 'features-section' },
      { activeId: 'features-section', sectionId: 'proof-section' },
      { activeId: 'plans-section', sectionId: 'plans-section' },
      { activeId: 'faq-section', sectionId: 'faq-section' },
      { activeId: 'faq-section', sectionId: 'waitlist-section' },
    ];

    navigationSections.forEach(({ activeId, sectionId }) => {
      ScrollTrigger.create({
        end: 'bottom 46%',
        onEnter: () => this._setActiveNavigationLink(activeId),
        onEnterBack: () => this._setActiveNavigationLink(activeId),
        start: 'top 46%',
        trigger: `#${sectionId}`,
      });
    });

    if (landingHeader) {
      const syncHeaderState = (): void => {
        landingHeader.classList.toggle('landing-header--scrolled', window.scrollY > 80);
      };

      ScrollTrigger.create({
        end: 'max',
        onRefresh: syncHeaderState,
        onUpdate: syncHeaderState,
        start: 0,
      });
      syncHeaderState();
    }

    gsap.to('.page-progress', {
      ease: 'none',
      scaleX: 1,
      scrollTrigger: {
        end: 'max',
        scrub: 0.25,
        start: 0,
      },
    });

    navigationLinks.forEach((link) => {
      const moveX = gsap.quickTo(link, 'x', { duration: 0.35, ease: 'power3.out' });
      const moveY = gsap.quickTo(link, 'y', { duration: 0.35, ease: 'power3.out' });
      const handlePointerMove = (event: PointerEvent): void => {
        const linkBounds = link.getBoundingClientRect();
        moveX((event.clientX - linkBounds.left - linkBounds.width / 2) * 0.12);
        moveY((event.clientY - linkBounds.top - linkBounds.height / 2) * 0.18);
      };
      const handlePointerLeave = (): void => {
        moveX(0);
        moveY(0);
      };

      link.addEventListener('pointermove', handlePointerMove);
      link.addEventListener('pointerleave', handlePointerLeave);
      this._interactionCleanup.push(() => {
        link.removeEventListener('pointermove', handlePointerMove);
        link.removeEventListener('pointerleave', handlePointerLeave);
      });
    });
  }

  private _initScrollAnimations(): void {
    const revealElements = gsap.utils.toArray<HTMLElement>('.gsap-reveal');
    const staggerGroups = gsap.utils.toArray<HTMLElement>('.gsap-stagger');

    revealElements.forEach((element) => {
      gsap.from(element, {
        autoAlpha: 0,
        clipPath: 'inset(0 0 28% 0)',
        duration: 1.15,
        ease: 'power4.out',
        scale: 0.96,
        scrollTrigger: {
          trigger: element,
          start: 'top 86%',
          toggleActions: 'play none none reverse',
        },
        y: 95,
      });
    });

    staggerGroups.forEach((group) => {
      if (group.classList.contains('methodology-steps')) {
        return;
      }

      gsap.from(group.children, {
        autoAlpha: 0,
        clipPath: 'inset(12% 8% 12% 8% round 2.4rem)',
        duration: 1.15,
        ease: 'power4.out',
        scale: 0.9,
        stagger: 0.16,
        scrollTrigger: {
          trigger: group,
          start: 'top 86%',
          toggleActions: 'play none none reverse',
        },
        y: 95,
      });
    });
  }

  private _initProductStoryAnimations(): void {
    const methodologySteps = gsap.utils.toArray<HTMLElement>('.methodology-step');

    gsap.fromTo(
      '.methodology-progress__fill',
      { scaleY: 0 },
      {
        ease: 'none',
        scaleY: 1,
        scrollTrigger: {
          end: 'bottom 48%',
          scrub: 0.45,
          start: 'top 68%',
          trigger: '.methodology-steps',
        },
      },
    );

    methodologySteps.forEach((step) => {
      gsap.fromTo(
        step,
        { autoAlpha: 0.28, scale: 0.93, x: 90 },
        {
          autoAlpha: 1,
          ease: 'none',
          scale: 1,
          scrollTrigger: {
            end: 'top 54%',
            scrub: 0.55,
            start: 'top 88%',
            trigger: step,
          },
          x: 0,
        },
      );
    });

    gsap.fromTo(
      '.gsap-product-demo',
      {
        autoAlpha: 0.35,
        clipPath: 'inset(12% 9% 12% 9% round 4rem)',
        scale: 0.88,
      },
      {
        autoAlpha: 1,
        clipPath: 'inset(0% 0% 0% 0% round 3rem)',
        ease: 'none',
        scale: 1,
        scrollTrigger: {
          end: 'top 32%',
          scrub: 0.7,
          start: 'top 88%',
          trigger: '.gsap-product-demo',
        },
      },
    );

    gsap.from('.library-demo-result', {
      autoAlpha: 0,
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        start: 'top 70%',
        toggleActions: 'play none none reverse',
        trigger: '.practice-dashboard',
      },
      x: -28,
    });

    gsap.from('.mini-progress span, .repertoire-status span', {
      duration: 1.2,
      ease: 'power4.out',
      scaleX: 0,
      stagger: 0.08,
      scrollTrigger: {
        start: 'top 82%',
        toggleActions: 'play none none reverse',
        trigger: '.use-cases',
      },
      transformOrigin: 'left center',
    });

    gsap.from('.library-selection-demo__summary, .library-selection-demo__metadata > span', {
      autoAlpha: 0,
      duration: 0.85,
      ease: 'power3.out',
      scale: 0.92,
      stagger: 0.08,
      scrollTrigger: {
        start: 'top 68%',
        toggleActions: 'play none none reverse',
        trigger: '.practice-dashboard',
      },
      y: 24,
    });

    gsap.from('.feature-grid', {
      autoAlpha: 0,
      duration: 0.85,
      ease: 'sine.out',
      scrollTrigger: {
        start: 'top 82%',
        toggleActions: 'play none none reverse',
        trigger: '.feature-grid',
      },
    });

    const waveBars = gsap.utils.toArray<HTMLElement>('.focus-visual__wave i');
    animateLandingWave(waveBars);

    const proofTimeline = gsap.timeline({
      scrollTrigger: {
        start: 'top 76%',
        toggleActions: 'play none none reverse',
        trigger: '.gsap-proof-statement',
      },
    });

    proofTimeline
      .from('.gsap-proof-statement .section-kicker', {
        autoAlpha: 0,
        duration: 0.6,
        y: 24,
      })
      .fromTo(
        '.proof-line > span',
        {
          autoAlpha: 0,
          clipPath: 'inset(100% 0 0 0)',
          rotate: 2,
          yPercent: 70,
        },
        {
          autoAlpha: 1,
          clipPath: 'inset(-15% -12% -24% -12%)',
          duration: 1,
          ease: 'power4.out',
          rotate: 0,
          stagger: 0.12,
          yPercent: 0,
        },
        '-=0.25',
      );

    if (window.matchMedia('(min-width: 768px)').matches) {
      gsap
        .timeline({
          scrollTrigger: {
            end: 'bottom top',
            scrub: 0.8,
            start: 'top top',
            trigger: '#hero-section',
          },
        })
        .to(
          '.hero-background',
          {
            clipPath: 'inset(6% 4% 9% 4% round 3.2rem)',
            ease: 'none',
            scale: 0.94,
          },
          0,
        )
        .to('.hero-content', { autoAlpha: 0, ease: 'none', scale: 0.9, yPercent: -18 }, 0)
        .to('.landing-footer', { autoAlpha: 0, ease: 'none', y: 35 }, 0);
    }
  }

  private _initProductShowcaseAnimation(): void {
    const productStage =
      this._elementRef.nativeElement.querySelector<HTMLElement>('.product-stage');
    const productMockup = productStage?.querySelector<HTMLElement>('.product-mockup');
    const productPerspective = productStage?.querySelector<HTMLElement>(
      '.product-stage__perspective',
    );
    const repertoireMockup = productStage?.querySelector<HTMLElement>('.repertoire-mockup');
    const setlistNote = productStage?.querySelector<HTMLElement>(
      '.product-scene-note--analytics',
    );
    const stageModeNote = productStage?.querySelector<HTMLElement>(
      '.product-scene-note--repertoire',
    );
    if (
      !productStage ||
      !productMockup ||
      !productPerspective ||
      !repertoireMockup ||
      !setlistNote ||
      !stageModeNote
    ) {
      return;
    }

    gsap.to('.product-showcase__type', {
      ease: 'none',
      scrollTrigger: {
        end: 'bottom top',
        scrub: 1.2,
        start: 'top bottom',
        trigger: '#product-showcase-section',
      },
      yPercent: 32,
    });

    gsap.from('.product-float-chip', {
      autoAlpha: 0,
      duration: 1,
      ease: 'back.out(1.5)',
      scale: 0.62,
      stagger: 0.18,
      scrollTrigger: {
        start: 'top 68%',
        toggleActions: 'play none none reverse',
        trigger: '.product-stage',
      },
      y: 70,
    });

    gsap.from('.setlist-demo-hero, .setlist-demo-heading, .setlist-demo-track', {
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      scale: 0.9,
      stagger: 0.1,
      scrollTrigger: {
        start: 'top 70%',
        toggleActions: 'play none none reverse',
        trigger: '.product-stage',
      },
      y: 35,
    });

    gsap.from('.setlist-demo-track__order', {
      duration: 0.65,
      ease: 'back.out(2)',
      scale: 0,
      stagger: 0.07,
      scrollTrigger: {
        start: 'top 66%',
        toggleActions: 'play none none reverse',
        trigger: '.product-stage',
      },
    });

    if (!window.matchMedia('(min-width: 768px)').matches) {
      gsap.from(productPerspective, {
        autoAlpha: 0,
        duration: 1.2,
        ease: 'power4.out',
        rotateX: 14,
        rotateY: -12,
        scale: 0.82,
        scrollTrigger: {
          start: 'top 88%',
          toggleActions: 'play none none reverse',
          trigger: productStage,
        },
        y: 90,
      });

      gsap.from(repertoireMockup, {
        autoAlpha: 0,
        duration: 1.1,
        ease: 'power4.out',
        rotateY: 14,
        scale: 0.86,
        scrollTrigger: {
          start: 'top 88%',
          toggleActions: 'play none none reverse',
          trigger: repertoireMockup,
        },
        x: 70,
      });

      gsap.from('.stage-demo-track', {
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
        scale: 0.86,
        stagger: 0.08,
        scrollTrigger: {
          start: 'top 82%',
          toggleActions: 'play none none reverse',
          trigger: repertoireMockup,
        },
        y: 24,
      });
      return;
    }

    const horizontalTimeline = gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          anticipatePin: 1,
          end: () => `+=${Math.max(window.innerWidth * 1.2, 1150)}`,
          invalidateOnRefresh: true,
          pin: true,
          scrub: 0.8,
          start: 'top top',
          trigger: productStage,
        },
      })
      .fromTo(
        productPerspective,
        { rotateX: 20, rotateY: -24, rotateZ: -3, scale: 0.7, y: 170 },
        { duration: 0.2, rotateX: 2, rotateY: 0, rotateZ: 0, scale: 1, y: 0 },
        0,
      )
      .to(productPerspective, { duration: 0.13, rotateX: 0, scale: 1 }, 0.2)
      .to(
        productMockup,
        {
          autoAlpha: 0,
          duration: 0.27,
          rotateY: 20,
          scale: 0.76,
          xPercent: -120,
        },
        0.33,
      )
      .to('.product-float-chip', { autoAlpha: 0, duration: 0.18, scale: 0.7, y: -30 }, 0.34)
      .to(setlistNote, { autoAlpha: 0, duration: 0.18, x: -50 }, 0.34)
      .fromTo(
        repertoireMockup,
        { autoAlpha: 0, rotateY: -20, scale: 0.76, xPercent: 120 },
        { autoAlpha: 1, duration: 0.3, rotateY: 0, scale: 1, xPercent: 0 },
        0.38,
      )
      .to(stageModeNote, { autoAlpha: 1, duration: 0.2, x: 0, y: 0 }, 0.52)
      .from(
        '.stage-demo-track',
        { autoAlpha: 0, duration: 0.22, scale: 0.82, stagger: 0.025, y: 24 },
        0.52,
      )
      .to(productPerspective, { duration: 0.24, rotateX: -2, scale: 0.98, y: -12 }, 0.76);

    horizontalTimeline.addLabel('setlist', 0.2).addLabel('stage-mode', 0.68);

    const moveRotationX = gsap.quickTo(productMockup, 'rotationX', {
      duration: 0.6,
      ease: 'power3.out',
    });
    const moveRotationY = gsap.quickTo(productMockup, 'rotationY', {
      duration: 0.6,
      ease: 'power3.out',
    });
    const moveRepertoireRotationX = gsap.quickTo(repertoireMockup, 'rotationX', {
      duration: 0.6,
      ease: 'power3.out',
    });
    const moveRepertoireRotationY = gsap.quickTo(repertoireMockup, 'rotationY', {
      duration: 0.6,
      ease: 'power3.out',
    });
    const handlePointerMove = (event: PointerEvent): void => {
      const stageBounds = productStage.getBoundingClientRect();
      const horizontalProgress = (event.clientX - stageBounds.left) / stageBounds.width - 0.5;
      const verticalProgress = (event.clientY - stageBounds.top) / stageBounds.height - 0.5;
      moveRotationX(verticalProgress * -5);
      moveRotationY(horizontalProgress * 8);
      moveRepertoireRotationX(verticalProgress * -5);
      moveRepertoireRotationY(horizontalProgress * 8);
    };
    const handlePointerLeave = (): void => {
      moveRotationX(0);
      moveRotationY(0);
      moveRepertoireRotationX(0);
      moveRepertoireRotationY(0);
    };

    productStage.addEventListener('pointermove', handlePointerMove, { passive: true });
    productStage.addEventListener('pointerleave', handlePointerLeave);
    this._interactionCleanup.push(() => {
      productStage.removeEventListener('pointermove', handlePointerMove);
      productStage.removeEventListener('pointerleave', handlePointerLeave);
    });
  }

  private _initParallaxEffects(): void {
    gsap.to('.hero-background img', {
      ease: 'none',
      scale: 1.08,
      scrollTrigger: {
        end: 'bottom top',
        scrub: 1,
        start: 'top top',
        trigger: '#hero-section',
      },
      yPercent: 10,
    });

    gsap.utils.toArray<HTMLElement>('.section-glow').forEach((glow) => {
      gsap.to(glow, {
        ease: 'none',
        scrollTrigger: {
          end: 'bottom top',
          scrub: 1.5,
          start: 'top bottom',
          trigger: glow.parentElement,
        },
        yPercent: 40,
      });
    });
  }

  private _setActiveNavigationLink(sectionId: string): void {
    const navigation =
      this._elementRef.nativeElement.querySelector<HTMLElement>('.landing-navigation');
    const indicator = navigation?.querySelector<HTMLElement>('.navigation-indicator');
    const activeLink = navigation?.querySelector<HTMLElement>(`[data-section="${sectionId}"]`);

    if (!navigation || !indicator || !activeLink) {
      return;
    }

    navigation
      .querySelectorAll('.navigation-link')
      .forEach((link) => link.classList.remove('is-active'));
    activeLink.classList.add('is-active');

    gsap.to(indicator, {
      autoAlpha: 1,
      duration: 0.45,
      ease: 'power3.out',
      width: activeLink.offsetWidth,
      x: activeLink.offsetLeft,
    });
  }

  private _setNavigationMenu(isOpen: boolean): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    this._isNavigationMenuOpen = isOpen;
    document.body.style.overflow = isOpen ? 'hidden' : '';

    if (isOpen) {
      this._navigationTimeline?.play();
      return;
    }

    this._navigationTimeline?.reverse();
  }
}
