'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import AuthStatus from '@/components/auth-status';
import { DEFAULT_AUTHOR_NICKNAME, formatRelativeKoreanTime } from '@/lib/helpers';
import { getAuthorDisplay, loadAuthorProfileMap, loadCurrentProfile } from '@/lib/profiles';
import { supabase } from '@/lib/supabase';
import type { AuthorProfileDisplay, Comment, GuestbookPost, Profile } from '@/lib/types';

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id;

  const [post, setPost] = useState<GuestbookPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorProfiles, setAuthorProfiles] = useState<Map<string, AuthorProfileDisplay>>(new Map());
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
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
        const loadedPost = postData as GuestbookPost;
        const loadedComments = (commentData as Comment[]) ?? [];
        setPost(loadedPost);
        setComments(loadedComments);

        try {
          const profileMap = await loadAuthorProfileMap([
            loadedPost.user_id,
            ...loadedComments.map((comment) => comment.user_id),
          ]);
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

    loadData();

    const channel = supabase
      .channel(`comments-insert-${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        (payload) => {
          const row = payload.new as Comment;
          setComments((prev) => [...prev, row]);

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
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [postId]);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError) {
        setError(sessionError.message);
      } else {
        const currentUser = data.session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          try {
            const profile = await loadCurrentProfile(currentUser.id);
            if (active) {
              setCurrentProfile(profile);
              setAuthorName((prev) => prev || profile?.nickname || currentUser.email?.split('@')[0] || DEFAULT_AUTHOR_NICKNAME);
            }
          } catch {
            if (active) {
              setCurrentProfile(null);
              setAuthorName((prev) => prev || currentUser.email?.split('@')[0] || DEFAULT_AUTHOR_NICKNAME);
            }
          }
        }
      }
      setAuthLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setCurrentProfile(null);
      setAuthLoading(false);
      setError(null);

      if (currentUser) {
        void loadCurrentProfile(currentUser.id)
          .then((profile) => {
            if (!active) return;
            setCurrentProfile(profile);
            setAuthorName((prev) => prev || profile?.nickname || currentUser.email?.split('@')[0] || DEFAULT_AUTHOR_NICKNAME);
          })
          .catch(() => {
            if (!active) return;
            setCurrentProfile(null);
            setAuthorName((prev) => prev || currentUser.email?.split('@')[0] || DEFAULT_AUTHOR_NICKNAME);
          });
      } else {
        setAuthorName('');
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      setError('로그인 후 댓글을 작성할 수 있습니다.');
      return;
    }

    const displayName =
      currentProfile?.nickname?.trim() || authorName.trim() || currentUser.email?.split('@')[0] || DEFAULT_AUTHOR_NICKNAME;

    if (!content.trim()) {
      setError('댓글 내용을 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: currentUser.id,
      author_name: displayName,
      content: content.trim(),
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setAuthorName(currentProfile?.nickname ?? currentUser.email?.split('@')[0] ?? DEFAULT_AUTHOR_NICKNAME);
      setContent('');
    }

    setSubmitting(false);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8 font-hand sm:py-12">
      <AuthStatus />
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
          {(() => {
            const postAuthor = getAuthorDisplay(authorProfiles, post.user_id);

            return (
              <div className="flex min-w-0 items-center gap-3 rounded-3xl border-[3px] border-black p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={postAuthor.avatar_url ?? undefined} alt="" className="h-12 w-12 rounded-full border-2 border-black object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-2xl">{postAuthor.nickname}</p>
                  <p className="text-lg">{formatRelativeKoreanTime(post.created_at)}</p>
                </div>
              </div>
            );
          })()}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt="선택한 포스트 이미지" className="w-full rounded-3xl border-[3px] border-black" />

          <section className="rounded-3xl border-[3px] border-black p-4">
            <h2 className="text-3xl">댓글</h2>
            <div className="mt-3 space-y-3">
              {comments.length === 0 && <p className="text-lg">아직 댓글이 없습니다.</p>}
              {comments.map((comment) => {
                const commentAuthor = getAuthorDisplay(authorProfiles, comment.user_id, comment.author_name);

                return (
                  <article key={comment.id} className="rounded-2xl border-2 border-black p-3">
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={commentAuthor.avatar_url ?? undefined} alt="" className="h-9 w-9 rounded-full border-2 border-black object-cover" />
                        <strong className="min-w-0 truncate text-xl">{commentAuthor.nickname}</strong>
                      </div>
                      <span className="shrink-0 text-lg">{formatRelativeKoreanTime(comment.created_at)}</span>
                    </div>
                    <p className="mt-1 break-words text-xl">{comment.content}</p>
                  </article>
                );
              })}
            </div>
          </section>

          {authLoading && <p className="text-xl">댓글 작성 권한을 확인하는 중...</p>}

          {!authLoading && !user && (
            <section className="rounded-3xl border-[3px] border-black p-4">
              <h2 className="text-3xl">댓글 작성</h2>
              <p className="mt-2 text-xl">로그인 후 댓글을 작성할 수 있습니다.</p>
              <Link href={`/login?next=/posts/${postId}`} className="mt-3 inline-block rounded-full border-[3px] border-black px-5 py-2 text-2xl">
                로그인
              </Link>
            </section>
          )}

          {!authLoading && user && (
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
          )}
        </>
      )}
    </main>
  );
}
