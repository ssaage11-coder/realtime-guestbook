export type ImageType = 'drawing' | 'photo';

export interface GuestbookPost {
  id: string;
  user_id: string | null;
  image_url: string;
  image_path: string;
  image_type: ImageType;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
}

export interface Profile {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthorProfileDisplay {
  user_id: string | null;
  nickname: string;
  avatar_url: string | null;
}
