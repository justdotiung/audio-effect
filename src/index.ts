import { roundWaveform } from './audio/effects.js';
import AudioEffect from './audio/audioEffect.js';

const container = document.querySelector('#container') as HTMLDivElement;
const file = document.querySelector('#fileupload') as HTMLInputElement;
const audio = document.querySelector('#audio1') as HTMLAudioElement;

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
  const effectAudio = new AudioEffect(audio, container, analyser);

  audio.load();
  audio.play();

  if (!audioSource) audioSource = audioCtx.createMediaElementSource(audio);
  audioSource.connect(analyser);
  analyser.connect(audioCtx.destination);
  const Visualiser = roundWaveform({ r: 222, g: 111, b: 18 });
  effectAudio.fftSize = 512;
  effectAudio.barWidth = 2;
  effectAudio.cnavas.width = window.innerWidth;
  effectAudio.cnavas.height = window.innerHeight;
  effectAudio.cnavas.setAttribute('id', 'canvas1');
  effectAudio.setDrawisualiser(Visualiser);
  effectAudio.animationFrame(() => {
    (document.querySelector('#canvas1') as HTMLCanvasElement) &&
      container.removeChild(document.querySelector('#canvas1') as HTMLCanvasElement);
  });
});
