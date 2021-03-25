const canvas = document.querySelector('#canvas1') as HTMLCanvasElement;
const file = document.querySelector('#fileupload') as HTMLInputElement;
const audio1 = document.querySelector('#audio1') as HTMLAudioElement;

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const ctx = canvas.getContext('2d');

class EffectAudio {
  private audioCtx;
  private audioSource;
  private analyser;

  constructor(audio: HTMLAudioElement) {
    this.audioCtx = new AudioContext();
    this.audioSource = this.audioCtx.createMediaElementSource(audio);
    this.analyser = this.audioCtx.createAnalyser();
    this.audioSource.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
  }

  set fftSize(num: number) {
    this.analyser.fftSize = num;
  }

  get frequencyBinCount() {
    return this.analyser.frequencyBinCount;
  }

  getByteFrequencyData(arr: Uint8Array) {
    this.analyser.getByteFrequencyData(arr);
  }
  resume() {
    this.audioCtx.resume();
  }
}

let effectAudio: EffectAudio;
file.addEventListener('change', () => {
  if (!file.files) return;
  const files = file.files;
  if (!effectAudio) effectAudio = new EffectAudio(audio1);
  audio1.src = URL.createObjectURL(files[0]);

  effectAudio.resume();
  audio1.load();
  audio1.play();
  effectAudio.fftSize = 512; //default 2048
  const bufferLength = effectAudio.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const barWidth = 2; //canvas.width / bufferLength;

  const animate = function () {
    if (!ctx) return;
    const x = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effectAudio.getByteFrequencyData(dataArray);
    drawVisualiser(bufferLength, x, barWidth, dataArray);

    if (
      audio1.currentTime >= audio1.duration &&
      !dataArray.find((element) => element > 1)
    ) {
      drawVisualiser(bufferLength, x, barWidth, dataArray);
    } else {
      requestAnimationFrame(animate);
    }
  };
  requestAnimationFrame(animate);
});

function drawVisualiser(
  bufferLength: number,
  x: number,
  barWidth: number,
  dataArray: Uint8Array
) {
  if (!ctx) return;
  let barHeight: number;
  let r, g, b;
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 2;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((i * Math.PI * 4) / bufferLength);
    r = (i * barHeight) / 20;
    g = i * 4;
    b = barHeight / 2;
    // const red
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, barWidth, barHeight);
    x += barWidth;
    ctx.restore();
  }
}
