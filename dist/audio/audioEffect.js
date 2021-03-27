export default class AudioEffect {
    constructor(audio, parentEl, analyser) {
        this.audio = audio;
        this._barWidth = 1;
        this.drawVisualiser = undefined;
        this._canvas = document.createElement('canvas');
        this.ctx = this._canvas.getContext('2d');
        parentEl.append(this._canvas);
        this.analyser = analyser;
    }
    set fftSize(num) {
        this.analyser.fftSize = num;
    }
    get cnavas() {
        return this._canvas;
    }
    set barWidth(num) {
        this._barWidth = num;
    }
    animationFrame(fn) {
        if (!this.drawVisualiser)
            throw new Error('not set function drawVisuliser');
        const x = 0;
        const barWidth = this._barWidth;
        const uint8Array = new Uint8Array(this.analyser.frequencyBinCount);
        this.ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this.analyser.getByteFrequencyData(uint8Array);
        this.drawVisualiser(this.analyser.frequencyBinCount, x, barWidth, uint8Array, this.ctx);
        if (this.audio.currentTime >= this.audio.duration &&
            !uint8Array.find((element) => element > 1)) {
            this.drawVisualiser(this.analyser.frequencyBinCount, x, barWidth, uint8Array, this.ctx);
            fn && fn();
        }
        else {
            requestAnimationFrame(() => this.animationFrame(fn));
        }
    }
    setDrawisualiser(fn) {
        this.drawVisualiser = fn;
    }
}
