// src/types.ts

export interface Cafe {
  id: string;
  placeId?: string;
  name: string;
  address: string;
  prefecture: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
  hours?: string[];
  googleRating?: number;
  googlePhotos?: string[];

  // 独自スコア（口コミの平均値）
  retroScore: number;       // 昭和感
  masterScore: number;      // マスター・ママ感
  soloScore: number;        // 一人入りやすさ
  timelessScore: number;    // 時代の止まり感
  overallScore: number;     // 総合評価
  reviewCount: number;

  tags: string[];
  signatureMenus: string[];
  established?: string;
  status: 'open' | 'closed' | 'unknown';
  coverPhoto?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  cafeId: string;
  userId: string;
  userName: string;
  userPhoto?: string;

  retroScore: number;
  masterScore: number;
  soloScore: number;
  timelessScore: number;
  overallScore: number;

  comment: string;
  visitDate: string;
  photos: string[];
  signatureMenus: string[];
  tags: string[];

  createdAt: Date;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoUrl?: string;
  role: 'user' | 'admin';
  reviewCount: number;
  createdAt: Date;
}

export interface SearchFilters {
  prefecture?: string;
  city?: string;
  minRetroScore?: number;
  minSoloScore?: number;
  tags?: string[];
  keyword?: string;
}

export const SCORE_LABELS: Record<string, { label: string; emoji: string; description: string }> = {
  retroScore:    { label: '昭和感',       emoji: '☕', description: '内装・食器・メニューの時代感' },
  masterScore:   { label: 'マスター感',   emoji: '👴', description: '個人経営らしい温かみ・人柄' },
  soloScore:     { label: '一人入りやすさ', emoji: '🪑', description: 'ひとりで入りやすい雰囲気' },
  timelessScore: { label: '時代の止まり感', emoji: '⏰', description: 'ここだけ時間が止まってる感覚' },
  overallScore:  { label: '総合評価',     emoji: '⭐', description: '純喫茶としての総合満足度' },
};

export const POPULAR_TAGS = [
  '昭和レトロ', '純喫茶', 'モーニング', '創業50年以上',
  'カウンター席', '禁煙', 'ナポリタン', 'クリームソーダ',
  'プリン', '手作りケーキ', '昭和30年代', '一人歓迎',
  '常連多め', '静かな空間', '古民家', '路地裏',
];
