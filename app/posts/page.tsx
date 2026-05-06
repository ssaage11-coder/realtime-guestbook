'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import AuthStatus from '@/components/auth-status';
import { formatRelativeKoreanTime } from '@/lib/helpers';
import { getAuthorDisplay, loadAuthorProfileMap } from '@/lib/profiles';
import { supabase } from '@/lib/supabase';
import type { AuthorProfileDisplay, GuestbookPost } from '@/lib/types';

export default function PostsPage() {
  const [posts, setPosts] = useState<GuestbookPost[]>([]);
  const [authorProfiles, setAuthorProfiles] = useState<Map<string, AuthorProfileDisplay>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoading(true);
      const { data, error: loadError } = await supabase
        .from('guestbook_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!active) return;
      if (loadError) {
        setError(loadError.message);
      } else {
        const loadedPosts = (data as GuestbookPost[]) ?? [];
        setPosts(loadedPosts);

        try {
          const profileMap = await loadAuthorProfileMap(loadedPosts.map((post) => post.user_id));
          if (active) {
            setAuthorProfiles(profileMap);
          }
        } catch {
          if (active) {
            setAuthorProfiles(new Map());
          }
        }
      }
      if (active) {
        setLoading(false);
      }
    }

    loadPosts();

    const channel = supabase
      .channel('guestbook-posts-insert')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guestbook_posts' }, (payload) => {
        const row = payload.new as GuestbookPost;
        setPosts((prev) => [row, ...prev.filter((item) => item.id !== row.id)]);

        if (row.user_id) {
          void loadAuthorProfileMap([row.user_id])
            .then((profileMap) => {
              setAuthorProfiles((prev) => {
                const next = new Map(prev);
                for (const [userId, profile] of profileMap) {
                  next.set(userId, profile);
                }
                return next;
              });
            })
            .catch(() => {
              setAuthorProfiles((prev) => new Map(prev));
            });
        }
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 font-hand sm:py-12">
      <AuthStatus />
      <div className="flex items-center justify-between">
        <h1 className="text-5xl">포스트잇 목록</h1>
        <Link href="/" className="rounded-full border-[3px] border-black px-4 py-1 text-2xl">
          새 글쓰기
        </Link>
      </div>

      {loading && <p className="text-xl">포스트를 불러오는 중...</p>}
      {error && <p className="text-xl text-red-600">오류: {error}</p>}

      {!loading && !error && posts.length === 0 && <p className="text-xl">아직 등록된 포스트가 없습니다.</p>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const author = getAuthorDisplay(authorProfiles, post.user_id);

          return (
            <Link
              href={`/posts/${post.id}`}
              key={post.id}
              className="rounded-3xl border-[3px] border-black bg-white p-3 transition hover:-translate-y-0.5"
            >
              <div className="mb-2 flex min-w-0 items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={author.avatar_url ?? undefined} alt="" className="h-9 w-9 rounded-full border-2 border-black object-cover" />
                <span className="min-w-0 truncate text-xl">{author.nickname}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt="방명록 이미지" className="h-44 w-full rounded-2xl object-cover" />
              <div className="mt-2 flex items-center justify-between text-lg">
                <span>{post.image_type === 'drawing' ? '그림' : '사진'}</span>
                <span>{formatRelativeKoreanTime(post.created_at)}</span>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
