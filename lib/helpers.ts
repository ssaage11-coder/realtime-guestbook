export function buildStoragePath(prefix: string, ext: string) {
  const safePrefix = prefix.replace(/[^a-z0-9-_]/gi, '').toLowerCase() || 'guestbook';
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  return `${safePrefix}/${timestamp}-${random}.${ext}`;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('캔버스를 이미지로 변환하지 못했습니다.'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}
