'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';

import AuthStatus from '@/components/auth-status';
import {
  DEFAULT_AUTHOR_NICKNAME,
  DEFAULT_AVATAR_URL,
  buildProfileAvatarPath,
  getAvatarExtension,
  normalizeNickname,
  validateAvatarFile,
  validateNickname,
} from '@/lib/helpers';
import { loadCurrentProfile, upsertCurrentProfile } from '@/lib/profiles';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

function toProfileError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return '프로필 저장 중 오류가 발생했습니다.';
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState(DEFAULT_AUTHOR_NICKNAME);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentAvatarUrl = avatarPreviewUrl ?? profile?.avatar_url ?? DEFAULT_AVATAR_URL;
  const loginHref = '/login?next=/profile';

  const nicknameError = useMemo(() => validateNickname(nickname), [nickname]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const { data, error } = await supabase.auth.getSession();
        if (!active) return;

        if (error) {
          throw error;
        }

        const currentUser = data.session?.user ?? null;
        setUser(currentUser);

        if (!currentUser) {
          setProfile(null);
          setNickname(DEFAULT_AUTHOR_NICKNAME);
          return;
        }

        const loadedProfile = await loadCurrentProfile(currentUser.id);
        if (!active) return;

        setProfile(loadedProfile);
        setNickname(loadedProfile?.nickname ?? DEFAULT_AUTHOR_NICKNAME);
      } catch (error) {
        if (active) {
          setErrorMessage(toProfileError(error));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setErrorMessage(null);
      setSuccessMessage(null);

      if (!currentUser) {
        setProfile(null);
        setNickname(DEFAULT_AUTHOR_NICKNAME);
        setLoading(false);
        return;
      }

      void loadCurrentProfile(currentUser.id)
        .then((loadedProfile) => {
          if (!active) return;
          setProfile(loadedProfile);
          setNickname(loadedProfile?.nickname ?? DEFAULT_AUTHOR_NICKNAME);
        })
        .catch((error) => {
          if (active) {
            setErrorMessage(toProfileError(error));
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSuccessMessage(null);

    if (!file) {
      setAvatarFile(null);
      setErrorMessage(null);
      return;
    }

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setAvatarFile(null);
      setErrorMessage(validationError);
      event.target.value = '';
      return;
    }

    setAvatarFile(file);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateNickname(nickname);
    if (validationError) {
      setErrorMessage(validationError);
      setSuccessMessage(null);
      return;
    }

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      setErrorMessage('로그인 후 프로필을 저장할 수 있습니다.');
      setSuccessMessage(null);
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let nextAvatarUrl = profile?.avatar_url ?? null;
      let nextAvatarPath = profile?.avatar_path ?? null;

      if (avatarFile) {
        const ext = getAvatarExtension(avatarFile);
        if (!ext) {
          throw new Error('프로필 이미지는 PNG, JPEG, WebP 파일만 사용할 수 있습니다.');
        }

        const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? 'guestbook-images';
        const avatarPath = buildProfileAvatarPath(currentUser.id, ext);
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(avatarPath, avatarFile, { upsert: false, contentType: avatarFile.type });

        if (uploadError) {
          throw new Error('프로필 이미지 업로드에 실패했습니다. 파일과 권한을 확인해 주세요.');
        }

        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(avatarPath);
        nextAvatarUrl = publicUrlData.publicUrl;
        nextAvatarPath = avatarPath;
      }

      const savedProfile = await upsertCurrentProfile({
        user_id: currentUser.id,
        nickname: normalizeNickname(nickname),
        avatar_url: nextAvatarUrl,
        avatar_path: nextAvatarPath,
      });

      setProfile(savedProfile);
      setNickname(savedProfile.nickname);
      setAvatarFile(null);
      setSuccessMessage('프로필을 저장했습니다.');
    } catch (error) {
      setErrorMessage(toProfileError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8 font-hand sm:py-12">
      <AuthStatus />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-5xl">프로필 설정</h1>
        <Link href="/posts" className="rounded-full border-[3px] border-black px-4 py-1 text-2xl">
          목록으로
        </Link>
      </div>

      {loading && <p className="text-xl">프로필을 불러오는 중...</p>}

      {!loading && !user && (
        <section className="rounded-3xl border-[3px] border-black p-4">
          <h2 className="text-3xl">로그인이 필요합니다</h2>
          <p className="mt-2 text-xl">프로필은 로그인한 사용자만 설정할 수 있습니다.</p>
          <Link href={loginHref} className="mt-3 inline-block rounded-full border-[3px] border-black px-5 py-2 text-2xl">
            로그인
          </Link>
        </section>
      )}

      {!loading && user && (
        <form onSubmit={handleSubmit} className="rounded-3xl border-[3px] border-black p-4">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex shrink-0 flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentAvatarUrl} alt="프로필 이미지 미리보기" className="h-32 w-32 rounded-full border-[3px] border-black object-cover" />
              <label className="cursor-pointer rounded-full border-[3px] border-black px-4 py-1 text-xl">
                이미지 선택
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <label className="flex flex-col text-xl">
                닉네임
                <input
                  value={nickname}
                  onChange={(event) => {
                    setNickname(event.target.value);
                    setSuccessMessage(null);
                  }}
                  className="rounded-xl border-2 border-black px-3 py-2"
                  maxLength={40}
                  aria-invalid={Boolean(nicknameError)}
                />
              </label>

              {nicknameError && <p className="text-sm text-red-600">{nicknameError}</p>}
              {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
              {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}

              <button
                type="submit"
                disabled={saving || Boolean(nicknameError)}
                className="self-start rounded-full border-[3px] border-black px-5 py-2 text-2xl disabled:opacity-40"
              >
                {saving ? '저장중...' : '저장'}
              </button>
            </div>
          </div>
        </form>
      )}
    </main>
  );
}
