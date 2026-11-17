import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type AudioContextConstructor = new (contextOptions?: AudioContextOptions) => AudioContext;

interface BrowserWindow extends Window {
  readonly AudioContext?: AudioContextConstructor;
  readonly webkitAudioContext?: AudioContextConstructor;
}

@Injectable({
  providedIn: 'root',
})
export class MetronomeAudioService {
  private static readonly _minimumTempo = 40;
  private static readonly _maximumTempo = 220;
  private static readonly _beatsPerMeasure = 4;
  private static readonly _schedulerLookAheadMilliseconds = 25;
  private static readonly _scheduleAheadSeconds = 0.1;
  private static readonly _clickDurationSeconds = 0.035;

  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _scheduledOscillators = new Set<OscillatorNode>();
  private _audioContext?: AudioContext;
  private _schedulerTimerId?: number;
  private _tempo = 120;
  private _currentBeatIndex = 0;
  private _nextClickTime = 0;
  private _playbackVersion = 0;
  private _isRunning = false;

  get tempo(): number {
    return this._tempo;
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  public async start(tempo: number): Promise<boolean> {
    this.stop();
    this.updateTempo(tempo);

    if (!isPlatformBrowser(this._platformId)) {
      return false;
    }

    const audioContext = this._getAudioContext();

    if (!audioContext) {
      return false;
    }

    const playbackVersion = this._playbackVersion;

    try {
      await audioContext.resume();
    } catch {
      return false;
    }

    if (playbackVersion !== this._playbackVersion) {
      return false;
    }

    this._isRunning = true;
    this._currentBeatIndex = 0;
    this._nextClickTime = audioContext.currentTime + 0.05;
    this._scheduleUpcomingClicks();
    this._schedulerTimerId = window.setInterval(
      () => this._scheduleUpcomingClicks(),
      MetronomeAudioService._schedulerLookAheadMilliseconds,
    );

    return true;
  }

  public stop(): void {
    this._playbackVersion += 1;
    this._isRunning = false;
    this._currentBeatIndex = 0;

    if (this._schedulerTimerId !== undefined && isPlatformBrowser(this._platformId)) {
      window.clearInterval(this._schedulerTimerId);
      this._schedulerTimerId = undefined;
    }

    this._scheduledOscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // The oscillator may already have completed its short click envelope.
      }
    });
    this._scheduledOscillators.clear();
  }

  public updateTempo(tempo: number): void {
    const normalizedTempo = Number.isFinite(tempo) ? tempo : MetronomeAudioService._minimumTempo;
    this._tempo = Math.min(
      MetronomeAudioService._maximumTempo,
      Math.max(MetronomeAudioService._minimumTempo, normalizedTempo),
    );
  }

  private _getAudioContext(): AudioContext | undefined {
    if (this._audioContext && this._audioContext.state !== 'closed') {
      return this._audioContext;
    }

    const browserWindow = window as BrowserWindow;
    const AudioContextClass = browserWindow.AudioContext ?? browserWindow.webkitAudioContext;

    if (!AudioContextClass) {
      return undefined;
    }

    try {
      this._audioContext = new AudioContextClass({ latencyHint: 'interactive' });
      return this._audioContext;
    } catch {
      return undefined;
    }
  }

  private _scheduleUpcomingClicks(): void {
    const audioContext = this._audioContext;

    if (!audioContext || !this._isRunning) {
      return;
    }

    const scheduleLimit = audioContext.currentTime + MetronomeAudioService._scheduleAheadSeconds;

    while (this._nextClickTime < scheduleLimit) {
      this._scheduleClick(this._currentBeatIndex, this._nextClickTime);
      this._nextClickTime += 60 / this._tempo;
      this._currentBeatIndex =
        (this._currentBeatIndex + 1) % MetronomeAudioService._beatsPerMeasure;
    }
  }

  private _scheduleClick(beatIndex: number, scheduledTime: number): void {
    const audioContext = this._audioContext;

    if (!audioContext) {
      return;
    }

    const isMeasureAccent = beatIndex === 0;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const clickVolume = isMeasureAccent ? 0.24 : 0.14;
    const clickFrequency = isMeasureAccent ? 1500 : 950;
    const clickEndTime = scheduledTime + MetronomeAudioService._clickDurationSeconds;

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(clickFrequency, scheduledTime);
    gainNode.gain.setValueAtTime(0.0001, scheduledTime);
    gainNode.gain.exponentialRampToValueAtTime(clickVolume, scheduledTime + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, clickEndTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.onended = () => {
      this._scheduledOscillators.delete(oscillator);
      oscillator.disconnect();
      gainNode.disconnect();
    };

    this._scheduledOscillators.add(oscillator);
    oscillator.start(scheduledTime);
    oscillator.stop(clickEndTime);
  }
}
