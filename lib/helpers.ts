import type { AuthorProfileDisplay } from '@/lib/types';

export const DEFAULT_AUTHOR_NICKNAME = '방문자';
export const DEFAULT_AVATAR_URL = '/default-avatar.svg';
export const MAX_NICKNAME_LENGTH = 20;
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export function buildStoragePath(prefix: string, ext: string, ownerId?: string) {
  const safePrefix = prefix.replace(/[^a-z0-9-_]/gi, '').toLowerCase() || 'guestbook';
  const safeOwnerId = ownerId?.replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  const fileName = `${timestamp}-${random}.${ext}`;

  return safeOwnerId ? `${safeOwnerId}/${safePrefix}/${fileName}` : `${safePrefix}/${fileName}`;
}

export function buildProfileAvatarPath(ownerId: string, ext: string) {
  return buildStoragePath('profile', ext, ownerId);
}

export function buildDefaultAuthorDisplay(userId: string | null = null): AuthorProfileDisplay {
  return {
    user_id: userId,
    nickname: DEFAULT_AUTHOR_NICKNAME,
    avatar_url: DEFAULT_AVATAR_URL,
  };
}

export function normalizeNickname(value: string) {
  return value.trim();
}

export function validateNickname(value: string) {
  const nickname = normalizeNickname(value);

  if (!nickname) {
    return '닉네임을 입력해 주세요.';
  }

  if (nickname.length > MAX_NICKNAME_LENGTH) {
    return `닉네임은 ${MAX_NICKNAME_LENGTH}자 이하로 입력해 주세요.`;
  }

  return null;
}

export function getAvatarExtension(file: File) {
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/jpeg') return 'jpg';
  if (file.type === 'image/webp') return 'webp';
  return null;
}

export function validateAvatarFile(file: File) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_TYPES)[number])) {
    return '프로필 이미지는 PNG, JPEG, WebP 파일만 사용할 수 있습니다.';
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return '프로필 이미지는 2MB 이하만 사용할 수 있습니다.';
  }

  return null;
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
