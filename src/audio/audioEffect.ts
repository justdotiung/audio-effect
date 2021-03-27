export default class AudioEffect {
  private analyser;
  private _canvas;
  private ctx;
  private _barWidth = 1;
  private drawVisualiser:
    | ((
        bufferLength: number,
        x: number,
        barWidth: number,
        dataArray: Uint8Array,
        ctx: CanvasRenderingContext2D
      ) => void)
    | undefined = undefined;

  constructor(
    private audio: HTMLAudioElement,
    parentEl: HTMLElement,
    analyser: AnalyserNode
  ) {
    this._canvas = document.createElement('canvas') as HTMLCanvasElement;
    this.ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    parentEl.append(this._canvas);
    this.analyser = analyser;
  }

  set fftSize(num: number) {
    this.analyser.fftSize = num;
  }

  get cnavas(): HTMLCanvasElement {
    return this._canvas;
  }

  set barWidth(num: number) {
    this._barWidth = num;
  }

  animationFrame(fn: () => void): void {
    if (!this.drawVisualiser) throw new Error('not set function drawVisuliser');
    const x = 0;
    const barWidth = this._barWidth;
    const uint8Array = new Uint8Array(this.analyser.frequencyBinCount);
    this.ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this.analyser.getByteFrequencyData(uint8Array);
    this.drawVisualiser(
      this.analyser.frequencyBinCount,
      x,
      barWidth,
      uint8Array,
      this.ctx
    );

    if (
      this.audio.currentTime >= this.audio.duration &&
      !uint8Array.find((element) => element > 1)
    ) {
      this.drawVisualiser(
        this.analyser.frequencyBinCount,
        x,
        barWidth,
        uint8Array,
        this.ctx
      );
      fn && fn();
    } else {
      requestAnimationFrame(() => this.animationFrame(fn));
    }
  }

  setDrawisualiser(
    fn: (
      bufferLength: number,
      x: number,
      barWidth: number,
      dataArray: Uint8Array,
      ctx: CanvasRenderingContext2D
    ) => void
  ): void {
    this.drawVisualiser = fn;
  }
}
