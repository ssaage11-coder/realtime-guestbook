'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

type AuthMode = 'signin' | 'signup';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/';

  const [mode, setMode] = useState<AuthMode>('signin');
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        setErrorMessage(error.message);
      } else {
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || password.length < 6) {
      setErrorMessage('이메일과 6자 이상 비밀번호를 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    const authCall =
      mode === 'signin'
        ? supabase.auth.signInWithPassword({ email: email.trim(), password })
        : supabase.auth.signUp({ email: email.trim(), password });

    const { data, error } = await authCall;

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    if (data.session) {
      router.replace(nextPath);
      return;
    }

    setMessage('가입 확인 메일을 보냈습니다. 메일 인증 후 로그인해 주세요.');
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    setErrorMessage(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 px-4 py-8 font-hand sm:py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-5xl">로그인</h1>
        <Link href="/" className="rounded-full border-[3px] border-black px-4 py-1 text-2xl">
          작성으로
        </Link>
      </div>

      {loading && <p className="text-xl">세션을 확인하는 중...</p>}

      {!loading && user && (
        <section className="rounded-3xl border-[3px] border-black p-4">
          <h2 className="text-3xl">로그인됨</h2>
          <p className="mt-2 break-all text-xl">{user.email}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={nextPath} className="rounded-full border-[3px] border-black px-5 py-2 text-2xl">
              계속하기
            </Link>
            <button type="button" onClick={handleSignOut} className="rounded-full border-[3px] border-black px-5 py-2 text-2xl">
              로그아웃
            </button>
          </div>
        </section>
      )}

      {!loading && !user && (
        <form onSubmit={handleSubmit} className="rounded-3xl border-[3px] border-black p-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`rounded-full border-2 border-black px-4 py-1 text-xl ${mode === 'signin' ? 'bg-black text-white' : 'bg-white'}`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`rounded-full border-2 border-black px-4 py-1 text-xl ${mode === 'signup' ? 'bg-black text-white' : 'bg-white'}`}
            >
              가입
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex flex-col text-xl">
              이메일
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-xl border-2 border-black px-3 py-2"
                autoComplete="email"
              />
            </label>
            <label className="flex flex-col text-xl">
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-xl border-2 border-black px-3 py-2"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                minLength={6}
              />
            </label>
          </div>

          {message && <p className="mt-3 text-lg">{message}</p>}
          {errorMessage && <p className="mt-3 text-lg text-red-600">오류: {errorMessage}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-full border-[3px] border-black px-5 py-2 text-2xl disabled:opacity-40"
          >
            {submitting ? '처리중...' : mode === 'signin' ? '로그인' : '가입'}
          </button>
        </form>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 px-4 py-8 font-hand sm:py-12">
          <h1 className="text-5xl">로그인</h1>
          <p className="text-xl">로그인 화면을 불러오는 중...</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
