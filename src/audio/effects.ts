type RGB = { r: number; g: number; b: number };
export const roundWaveform = ({ r, g, b }: RGB) => (
  bufferLength: number,
  x: number,
  barWidth: number,
  dataArray: Uint8Array,
  ctx: CanvasRenderingContext2D
): void => {
  if (!ctx) return;
  let barHeight: number;
  // let r, g, b;
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 2;
    ctx.save();
    ctx.translate(400 / 2, 400 / 2);
    ctx.rotate((i * Math.PI * 4) / bufferLength);
    // r = (i * barHeight) / 20;
    // g = i * 4;
    // b = barHeight / 2;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, barWidth, barHeight);
    x += barWidth;
    ctx.restore();
  }
};
