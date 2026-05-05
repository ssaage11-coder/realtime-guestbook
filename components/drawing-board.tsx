'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { buildStoragePath, canvasToBlob } from '@/lib/helpers';
import { supabase } from '@/lib/supabase';
import type { ImageType } from '@/lib/types';

function toErrorMessage(error: unknown) {
  if (!error) return '알 수 없는 오류가 발생했습니다.';
  if (error instanceof Error) return error.message;
  if (typeof error === 'object') {
    const maybeMessage = (error as { message?: string }).message;
    if (maybeMessage) return maybeMessage;
    return JSON.stringify(error);
  }
  return String(error);
}

export default function DrawingBoard() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const photoPreviewUrl = useMemo(() => (photoFile ? URL.createObjectURL(photoFile) : null), [photoFile]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
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
    setHasStroke(true);
    setErrorMessage(null);
  };

  const handleMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPhotoFile(file);
    setErrorMessage(null);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasStroke(false);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    if (!hasStroke && !photoFile) {
      setErrorMessage('그림을 그리거나 사진을 첨부한 뒤 등록해 주세요.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let imageBlob: Blob;
      let ext: string;
      let imageType: ImageType;

      if (photoFile) {
        imageBlob = photoFile;
        ext = photoFile.type.includes('png') ? 'png' : 'jpg';
        imageType = 'photo';
      } else {
        imageBlob = await canvasToBlob(canvas);
        ext = 'png';
        imageType = 'drawing';
      }

      const imagePath = buildStoragePath('guestbook-images', ext);
      const { error: uploadError } = await supabase.storage
        .from('guestbook-images')
        .upload(imagePath, imageBlob, { upsert: false, contentType: imageBlob.type || 'image/png' });

      if (uploadError) {
        throw new Error(`Storage 업로드 실패: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage.from('guestbook-images').getPublicUrl(imagePath);
      const imageUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from('guestbook_posts').insert({
        image_url: imageUrl,
        image_path: imagePath,
        image_type: imageType,
      });

      if (insertError) {
        throw new Error(`DB 저장 실패: ${insertError.message}`);
      }

      router.push('/posts');
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
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
        onPointerUp={() => setIsDrawing(false)}
        onPointerLeave={() => setIsDrawing(false)}
      />

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {photoPreviewUrl && (
        <div className="rounded-2xl border-2 border-black p-2">
          <p className="mb-2 text-sm">첨부된 사진 미리보기</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoPreviewUrl} alt="첨부된 사진 미리보기" className="max-h-56 w-auto rounded-lg" />
        </div>
      )}

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="flex flex-wrap gap-3 self-center">
        <button
          type="button"
          className="rounded-full border-[3px] border-black px-5 py-2 text-2xl"
          onClick={() => fileInputRef.current?.click()}
        >
          사진첨부
        </button>
        <button type="button" className="rounded-full border-[3px] border-black px-5 py-2 text-2xl" onClick={handleClear}>
          지우기
        </button>
        <button
          type="button"
          className="rounded-full border-[3px] border-black px-5 py-2 text-2xl disabled:opacity-40"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '등록중...' : '등록'}
        </button>
      </div>
    </section>
  );
}
