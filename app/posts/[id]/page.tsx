'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { formatRelativeKoreanTime } from '@/lib/helpers';
import { supabase } from '@/lib/supabase';
import type { Comment, GuestbookPost } from '@/lib/types';

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id;

  const [post, setPost] = useState<GuestbookPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      const [{ data: postData, error: postError }, { data: commentData, error: commentError }] = await Promise.all([
        supabase.from('guestbook_posts').select('*').eq('id', postId).single(),
        supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true }),
      ]);

      if (!active) return;
      if (postError || commentError) {
        setError(postError?.message ?? commentError?.message ?? '데이터 조회에 실패했습니다.');
      } else {
        setPost(postData as GuestbookPost);
        setComments((commentData as Comment[]) ?? []);
      }
      setLoading(false);
    }

    loadData();

    const channel = supabase
      .channel(`comments-insert-${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        (payload) => {
          const row = payload.new as Comment;
          setComments((prev) => [...prev, row]);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authorName.trim() || !content.trim()) {
      setError('이름과 댓글 내용을 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('comments').insert({
      post_id: postId,
      author_name: authorName.trim(),
      content: content.trim(),
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setAuthorName('');
      setContent('');
    }

    setSubmitting(false);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8 font-hand sm:py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-5xl">방명록 상세</h1>
        <Link href="/posts" className="rounded-full border-[3px] border-black px-4 py-1 text-2xl">
          목록으로
        </Link>
      </div>

      {loading && <p className="text-xl">상세 정보를 불러오는 중...</p>}
      {error && <p className="text-xl text-red-600">오류: {error}</p>}

      {!loading && post && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt="선택한 포스트 이미지" className="w-full rounded-3xl border-[3px] border-black" />

          <section className="rounded-3xl border-[3px] border-black p-4">
            <h2 className="text-3xl">댓글</h2>
            <div className="mt-3 space-y-3">
              {comments.length === 0 && <p className="text-lg">아직 댓글이 없습니다.</p>}
              {comments.map((comment) => (
                <article key={comment.id} className="rounded-2xl border-2 border-black p-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-xl">{comment.author_name}</strong>
                    <span className="text-lg">{formatRelativeKoreanTime(comment.created_at)}</span>
                  </div>
                  <p className="mt-1 text-xl">{comment.content}</p>
                </article>
              ))}
            </div>
          </section>

          <form onSubmit={handleSubmit} className="rounded-3xl border-[3px] border-black p-4">
            <h2 className="text-3xl">댓글 작성</h2>
            <div className="mt-3 space-y-3">
              <label className="flex flex-col text-xl">
                이름
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="rounded-xl border-2 border-black px-3 py-2"
                  maxLength={20}
                />
              </label>
              <label className="flex flex-col text-xl">
                댓글
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-24 rounded-xl border-2 border-black px-3 py-2"
                  maxLength={300}
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full border-[3px] border-black px-5 py-2 text-2xl disabled:opacity-40"
              >
                {submitting ? '등록중...' : '댓글 등록'}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
