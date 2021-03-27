const container = document.querySelector('#container') as HTMLDivElement;
const file = document.querySelector('#fileupload') as HTMLInputElement;
const audio = document.querySelector('#audio1') as HTMLAudioElement;

class EffectAudio {
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

  get cnavas() {
    return this._canvas;
  }

  set barWidth(num: number) {
    this._barWidth = num;
  }

  animationFrame(fn: () => void) {
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
  ) {
    this.drawVisualiser = fn;
  }
}
const audioCtx = new AudioContext();
let audioSource: MediaElementAudioSourceNode | undefined;

file.addEventListener('change', () => {
  if (!file.files) return;

  document.querySelector('#canvas1') &&
    container.removeChild(document.querySelector('#canvas1') as HTMLCanvasElement);

  const files = file.files;
  audio.src = URL.createObjectURL(files[0]);

  audioCtx.resume();

  const analyser = audioCtx.createAnalyser();
  const effectAudio = new EffectAudio(audio, container, analyser);

  audio.load();
  audio.play();

  if (!audioSource) audioSource = audioCtx.createMediaElementSource(audio);
  audioSource.connect(analyser);
  analyser.connect(audioCtx.destination);

  effectAudio.fftSize = 512;
  effectAudio.barWidth = 2;
  effectAudio.cnavas.width = window.innerWidth;
  effectAudio.cnavas.height = window.innerHeight;
  effectAudio.cnavas.setAttribute('id', 'canvas1');
  effectAudio.setDrawisualiser(drawVisualiser);
  effectAudio.animationFrame(() => {
    container.removeChild(effectAudio.cnavas);
  });
});

function drawVisualiser(
  bufferLength: number,
  x: number,
  barWidth: number,
  dataArray: Uint8Array,
  ctx: CanvasRenderingContext2D
): void {
  if (!ctx) return;
  let barHeight: number;
  let r, g, b;
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 2;
    ctx.save();
    ctx.translate(400 / 2, 400 / 2);
    ctx.rotate((i * Math.PI * 4) / bufferLength);
    r = (i * barHeight) / 20;
    g = i * 4;
    b = barHeight / 2;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, barWidth, barHeight);
    x += barWidth;
    ctx.restore();
  }
}
