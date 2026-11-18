/**
 * Web Audio retro arcade synthesizer with mute toggle and safe no-op fallback.
 */
export class SoundFX {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    setMuted(muted) {
        this.muted = Boolean(muted);
    }

    init() {
        if (typeof window === 'undefined') return;
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    playTone(freq, type, duration, vol = 0.12, slideFreq = null) {
        if (this.muted || typeof window === 'undefined') return;
        try {
            this.init();
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (slideFreq) {
                osc.frequency.exponentialRampToValueAtTime(
                    slideFreq,
                    this.ctx.currentTime + duration
                );
            }
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (_) {
            // Audio playback can be blocked prior to first user gesture
        }
    }

    pee() {
        this.playTone(620, 'sine', 0.34, 0.11, 320);
    }

    poop() {
        this.playTone(235, 'triangle', 0.28, 0.14, 110);
    }

    pickup() {
        this.playTone(523.25, 'sine', 0.09, 0.11);
        setTimeout(() => this.playTone(659.25, 'sine', 0.14, 0.11), 85);
    }

    sniff() {
        this.playTone(390, 'sine', 0.05, 0.05, 480);
    }

    matcha() {
        this.playTone(440, 'triangle', 0.09, 0.11);
        setTimeout(() => this.playTone(554.37, 'triangle', 0.09, 0.11), 75);
        setTimeout(() => this.playTone(659.25, 'triangle', 0.18, 0.13), 150);
    }

    deli() {
        // Cozy Italian shop door chime + creamy puppuccino pop
        this.playTone(783.99, 'sine', 0.12, 0.12);
        setTimeout(() => this.playTone(987.77, 'sine', 0.14, 0.12), 95);
        setTimeout(() => this.playTone(1174.66, 'triangle', 0.22, 0.13), 190);
    }

    zoomies() {
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((n, idx) => {
            setTimeout(() => this.playTone(n, 'sine', 0.1, 0.09), idx * 55);
        });
    }

    treat() {
        this.playTone(587.33, 'triangle', 0.08, 0.11);
        setTimeout(() => this.playTone(880, 'triangle', 0.12, 0.11), 70);
    }

    horn() {
        this.playTone(340, 'sawtooth', 0.11, 0.09);
        setTimeout(() => this.playTone(285, 'sawtooth', 0.18, 0.09), 110);
    }

    barkGood() {
        this.playTone(480, 'square', 0.07, 0.06, 620);
        setTimeout(() => this.playTone(520, 'square', 0.09, 0.06, 680), 90);
    }

    barkBad() {
        this.playTone(165, 'sawtooth', 0.18, 0.11, 110);
        setTimeout(() => this.playTone(145, 'sawtooth', 0.22, 0.11, 95), 160);
    }

    suspicionTick() {
        this.playTone(690, 'triangle', 0.06, 0.05);
    }

    yell() {
        this.playTone(270, 'sawtooth', 0.26, 0.12, 175);
    }

    witchCaught() {
        this.playTone(300, 'sawtooth', 0.24, 0.15, 120);
        setTimeout(() => this.playTone(220, 'sawtooth', 0.42, 0.16, 75), 210);
    }

    win() {
        [523.25, 659.25, 783.99, 1046.5].forEach((n, idx) => {
            setTimeout(() => this.playTone(n, 'triangle', 0.18, 0.13), idx * 105);
        });
    }
}
