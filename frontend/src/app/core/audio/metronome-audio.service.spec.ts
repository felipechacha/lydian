import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { MetronomeAudioService } from './metronome-audio.service';

class FakeAudioParameter {
  constructor(private readonly _valueScheduled?: (value: number) => void) {}

  setValueAtTime(value: number): void {
    this._valueScheduled?.(value);
  }

  exponentialRampToValueAtTime(): void {}
}

class FakeOscillator {
  readonly frequency: FakeAudioParameter;
  type: OscillatorType = 'sine';
  onended: (() => void) | null = null;

  constructor(valueScheduled: (value: number) => void) {
    this.frequency = new FakeAudioParameter(valueScheduled);
  }

  connect(): void {}
  disconnect(): void {}
  start(): void {}
  stop(): void {}
}

class FakeGain {
  readonly gain = new FakeAudioParameter();

  connect(): void {}
  disconnect(): void {}
}

describe('MetronomeAudioService', () => {
  let service: MetronomeAudioService;
  let scheduledFrequencies: number[];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    scheduledFrequencies = [];

    class FakeAudioContext {
      readonly destination = {};
      state: AudioContextState = 'suspended';

      get currentTime(): number {
        return Date.now() / 1000;
      }

      async resume(): Promise<void> {
        this.state = 'running';
      }

      createOscillator(): FakeOscillator {
        return new FakeOscillator((value) => scheduledFrequencies.push(value));
      }

      createGain(): FakeGain {
        return new FakeGain();
      }
    }

    vi.stubGlobal('AudioContext', FakeAudioContext);
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: FakeAudioContext,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(MetronomeAudioService);
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should schedule an accented first beat in each 4/4 measure', async () => {
    await expect(service.start(120)).resolves.toBe(true);
    await vi.advanceTimersByTimeAsync(2025);

    expect(scheduledFrequencies.slice(0, 5)).toEqual([1500, 950, 950, 950, 1500]);
    expect(service.isRunning).toBe(true);
  });

  it('should stop scheduling clicks when playback is paused', async () => {
    await service.start(120);
    service.stop();
    const scheduledClickCount = scheduledFrequencies.length;

    await vi.advanceTimersByTimeAsync(1000);

    expect(scheduledFrequencies).toHaveLength(scheduledClickCount);
    expect(service.isRunning).toBe(false);
  });

  it('should keep tempo inside the supported range', () => {
    service.updateTempo(20);
    expect(service.tempo).toBe(40);

    service.updateTempo(280);
    expect(service.tempo).toBe(220);
  });
});
