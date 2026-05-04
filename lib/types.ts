export type ImageType = 'drawing' | 'photo';

export interface GuestbookPost {
  id: string;
  image_url: string;
  image_path: string;
  image_type: ImageType;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
}
