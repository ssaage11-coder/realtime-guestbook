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

export function formatRelativeKoreanTime(isoDate: string) {
  const createdAt = new Date(isoDate).getTime();
  const now = Date.now();
  const diffSec = Math.max(1, Math.floor((now - createdAt) / 1000));

  if (diffSec < 60) return '방금 전';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}
