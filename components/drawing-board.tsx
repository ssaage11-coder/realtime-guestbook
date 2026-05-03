'use client';

import { useRef, useState } from 'react';

export default function DrawingBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleStart = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
  };

  const handleMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <section className="flex w-full max-w-xl flex-col gap-4">
      <canvas
        ref={canvasRef}
        width={720}
        height={460}
        className="h-[300px] w-full rounded-[28px] border-[3px] border-black bg-white touch-none sm:h-[420px]"
        onPointerDown={handleStart}
        onPointerMove={handleMove}
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
      />
      <div className="flex gap-3 self-center">
        <button type="button" className="rounded-full border-[3px] border-black px-5 py-2 text-2xl" aria-label="사진첨부">
          사진첨부
        </button>
        <button type="button" className="rounded-full border-[3px] border-black px-5 py-2 text-2xl" onClick={clear}>
          지우기
        </button>
        <button type="button" className="rounded-full border-[3px] border-black px-5 py-2 text-2xl" aria-label="등록">
          등록
        </button>
      </div>
    </section>
  );
}
