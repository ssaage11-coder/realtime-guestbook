'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { formatRelativeKoreanTime } from '@/lib/helpers';
import { supabase } from '@/lib/supabase';
import type { GuestbookPost } from '@/lib/types';

export default function PostsPage() {
  const [posts, setPosts] = useState<GuestbookPost[]>([]);
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
        setPosts((data as GuestbookPost[]) ?? []);
      }
      setLoading(false);
    }

    loadPosts();

    const channel = supabase
      .channel('guestbook-posts-insert')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guestbook_posts' }, (payload) => {
        const row = payload.new as GuestbookPost;
        setPosts((prev) => [row, ...prev.filter((item) => item.id !== row.id)]);
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 font-hand sm:py-12">
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
        {posts.map((post) => (
          <Link
            href={`/posts/${post.id}`}
            key={post.id}
            className="rounded-3xl border-[3px] border-black bg-white p-3 transition hover:-translate-y-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt="방명록 이미지" className="h-44 w-full rounded-2xl object-cover" />
            <div className="mt-2 flex items-center justify-between text-lg">
              <span>{post.image_type === 'drawing' ? '그림' : '사진'}</span>
              <span>{formatRelativeKoreanTime(post.created_at)}</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
