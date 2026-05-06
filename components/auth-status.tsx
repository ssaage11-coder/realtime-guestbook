'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

import { loadCurrentProfile } from '@/lib/profiles';
import { supabase } from '@/lib/supabase';

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) {
        setErrorMessage(error.message);
      } else {
        const currentUser = data.session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          try {
            const profile = await loadCurrentProfile(currentUser.id);
            if (active) {
              setNickname(profile?.nickname ?? null);
            }
          } catch {
            if (active) {
              setNickname(null);
            }
          }
        }
      }
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setNickname(null);
      setErrorMessage(null);
      setLoading(false);

      if (currentUser) {
        void loadCurrentProfile(currentUser.id)
          .then((profile) => {
            if (active) {
              setNickname(profile?.nickname ?? null);
            }
          })
          .catch(() => {
            if (active) {
              setNickname(null);
            }
          });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setErrorMessage(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(error.message);
    }
  };

  const displayName = nickname ?? user?.email ?? '로그인 사용자';

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 text-lg">
      {loading && <span>세션 확인중...</span>}
      {!loading && user && (
        <>
          <span className="max-w-[220px] truncate">{displayName}</span>
          <Link href="/profile" className="rounded-full border-2 border-black px-3 py-1">
            프로필
          </Link>
          <button type="button" onClick={handleSignOut} className="rounded-full border-2 border-black px-3 py-1">
            로그아웃
          </button>
        </>
      )}
      {!loading && !user && (
        <Link href="/login" className="rounded-full border-2 border-black px-3 py-1">
          로그인
        </Link>
      )}
      {errorMessage && <span className="basis-full text-right text-sm text-red-600">{errorMessage}</span>}
    </div>
  );
}
