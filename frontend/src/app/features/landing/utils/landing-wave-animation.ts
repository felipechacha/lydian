import { gsap } from 'gsap';

const LANDING_WAVE_PATTERN = [
  { duration: 0.78, opacity: 0.72, scale: 0.4 },
  { duration: 0.9, opacity: 0.8, scale: 0.58 },
  { duration: 0.72, opacity: 0.68, scale: 0.32 },
  { duration: 0.96, opacity: 0.84, scale: 0.68 },
  { duration: 0.82, opacity: 0.74, scale: 0.42 },
  { duration: 0.76, opacity: 0.88, scale: 0.72 },
  { duration: 0.92, opacity: 0.7, scale: 0.34 },
  { duration: 0.8, opacity: 0.82, scale: 0.56 },
  { duration: 0.88, opacity: 0.74, scale: 0.38 },
] as const;

export function animateLandingWave(bars: HTMLElement[]): void {
  bars.forEach((bar, index) => {
    const pattern = LANDING_WAVE_PATTERN[index % LANDING_WAVE_PATTERN.length];

    gsap.fromTo(
      bar,
      { opacity: 1, scaleY: 1 },
      {
        delay: index * -0.1,
        duration: pattern.duration,
        ease: 'power1.inOut',
        opacity: pattern.opacity,
        repeat: -1,
        scaleY: pattern.scale,
        transformOrigin: 'center center',
        yoyo: true,
      },
    );
  });
}
