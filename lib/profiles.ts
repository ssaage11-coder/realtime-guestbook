import { DEFAULT_AVATAR_URL, DEFAULT_AUTHOR_NICKNAME } from '@/lib/helpers';
import { supabase } from '@/lib/supabase';
import type { AuthorProfileDisplay, Profile } from '@/lib/types';

const PROFILE_COLUMNS = 'user_id,nickname,avatar_url,avatar_path,created_at,updated_at';
const PUBLIC_PROFILE_COLUMNS = 'user_id,nickname,avatar_url';

export function toAuthorDisplay(
  profile: AuthorProfileDisplay | null | undefined,
  userId: string | null = null,
  fallbackName?: string | null,
): AuthorProfileDisplay {
  const fallback = fallbackName?.trim();

  if (!profile) {
    return {
      user_id: userId,
      nickname: fallback || DEFAULT_AUTHOR_NICKNAME,
      avatar_url: DEFAULT_AVATAR_URL,
    };
  }

  return {
    user_id: profile.user_id ?? userId,
    nickname: profile.nickname?.trim() || fallback || DEFAULT_AUTHOR_NICKNAME,
    avatar_url: profile.avatar_url || DEFAULT_AVATAR_URL,
  };
}

export function getAuthorDisplay(
  profiles: Map<string, AuthorProfileDisplay>,
  userId: string | null,
  fallbackName?: string | null,
) {
  if (!userId) {
    return toAuthorDisplay(null, null, fallbackName);
  }

  return toAuthorDisplay(profiles.get(userId), userId, fallbackName);
}

export async function loadCurrentProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('user_id', userId).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Profile | null) ?? null;
}

export async function upsertCurrentProfile(profile: {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  avatar_path: string | null;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as Profile;
}

export async function loadAuthorProfileMap(userIds: Array<string | null | undefined>) {
  const uniqueIds = Array.from(new Set(userIds.filter((userId): userId is string => Boolean(userId))));
  const profileMap = new Map<string, AuthorProfileDisplay>();

  if (uniqueIds.length === 0) {
    return profileMap;
  }

  const { data, error } = await supabase.from('profile_public').select(PUBLIC_PROFILE_COLUMNS).in('user_id', uniqueIds);

  if (error) {
    throw error;
  }

  for (const profile of (data as AuthorProfileDisplay[]) ?? []) {
    profileMap.set(profile.user_id as string, toAuthorDisplay(profile, profile.user_id));
  }

  return profileMap;
}
