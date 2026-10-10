import { supabase, SUPABASE_STORAGE_BASE } from './assetStorage';

export interface ReviewItem {
  id: string;
  name: string;
  emoji: string;
  emojiLabel: string;
  variant: string;
  comment: string;
  date: string;
  likes: number;
}

export const INITIAL_4_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Rian Ardiansyah',
    emoji: '😍',
    emojiLabel: 'Sangat Puas & Mewah',
    variant: 'Mykonos Monaco Royale',
    comment:
      'Gila sih wanginya beneran mewah banget! Semprot pagi sebelum ngantor, malem pas pulang masih nempel kuat di kemeja. Rekan kerja cowo & cewe pada nanya pake parfum apa. Auto langganan terus di SINKI!',
    date: 'Hari ini',
    likes: 42,
  },
  {
    id: 'rev-2',
    name: 'Clarissa Putri',
    emoji: '🥰',
    emojiLabel: 'Suka Parah',
    variant: 'Mykonos Isfahan',
    comment:
      'Rose oud-nya berkelas parah, nggak bikin pusing sama sekali. Wanginya kalem tapi ninggalin jejak harum pas lewat. Semprotan botolnya juga halus banget kayak parfum jutaan. Puas pol!',
    date: 'Kemarin',
    likes: 38,
  },
  {
    id: 'rev-3',
    name: 'Bagus Wicaksono',
    emoji: '🔥',
    emojiLabel: 'Tahan Seharian',
    variant: 'Mykonos French Cognac',
    comment:
      'Packingnya tebel banget bubble wrap berlapis jadi botol kaca aman 100%. Aroma cognac dan kayu manisnya hangat maskulin elegan, cocok banget buat date night atau acara formal.',
    date: '2 hari lalu',
    likes: 29,
  },
  {
    id: 'rev-4',
    name: 'Nadia Safitri',
    emoji: '✨',
    emojiLabel: 'Wangi Elegan',
    variant: 'Mykonos Blanche De Sinki',
    comment:
      'Buat yang suka wangi clean, fresh, aroma baju bersih mewah ala hotel bintang 5 wajib coba varian ini. Lembut banget ga nusuk hidung. Pasangan suka banget nyiumin terus.',
    date: '3 hari lalu',
    likes: 25,
  },
];

const LOCAL_STORAGE_KEY = 'sinki_reviews_v4';
const REVIEWS_FILE_NAME = 'reviews.json';
const REVIEWS_PUBLIC_URL = `${SUPABASE_STORAGE_BASE}${REVIEWS_FILE_NAME}`;

/**
 * Mengambil ulasan dari penyimpanan lokal (instant cache agar tampilan langsung muncul tanpa loading lama)
 */
export const getCachedReviews = (): ReviewItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed reading reviews cache:', err);
  }
  return INITIAL_4_REVIEWS;
};

/**
 * Menyimpan ulasan ke cache lokal browser
 */
export const setCachedReviews = (reviews: ReviewItem[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.error('Failed setting reviews cache:', err);
  }
};

/**
 * Mengambil ulasan publik dari Supabase Storage secara real-time
 */
export const fetchReviewsFromSupabase = async (): Promise<ReviewItem[]> => {
  try {
    const res = await fetch(`${REVIEWS_PUBLIC_URL}?t=${Date.now()}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCachedReviews(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Network fetch from Supabase reviews failed, trying supabase client download...', err);
  }

  // Fallback direct download via Supabase client jika fetch publik gagal
  try {
    const { data, error } = await supabase.storage.from('sinki-media').download(REVIEWS_FILE_NAME);
    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCachedReviews(parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.error('Direct download of reviews failed:', e);
  }

  return getCachedReviews();
};

/**
 * Menyimpan ulasan baru ke Supabase Storage (Otomatis tampil ke semua pengunjung)
 */
export const MAX_REVIEWS_LIMIT = 6;

export const saveReviewToSupabase = async (
  newReview: ReviewItem
): Promise<{ success: boolean; reviews: ReviewItem[] }> => {
  try {
    // 1. Ambil daftar ulasan terkini dari Supabase agar tidak menimpa ulasan orang lain
    const currentList = await fetchReviewsFromSupabase();

    // 2. Masukkan ulasan baru di baris paling atas (#1), batasi maksimal 6 ulasan terbaru (Opsi B: Rolling Limit)
    const updatedList = [newReview, ...currentList.filter((r) => r.id !== newReview.id)].slice(0, MAX_REVIEWS_LIMIT);

    // 3. Upload ke Supabase Storage
    const { error } = await supabase.storage
      .from('sinki-media')
      .upload(REVIEWS_FILE_NAME, JSON.stringify(updatedList, null, 2), {
        contentType: 'application/json',
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload review error:', error);
      // Tetap simpan di local cache agar ulasan tidak hilang bagi si penulis
      setCachedReviews(updatedList);
      return { success: false, reviews: updatedList };
    }

    setCachedReviews(updatedList);
    return { success: true, reviews: updatedList };
  } catch (err) {
    console.error('Exception saving review to Supabase:', err);
    const cached = getCachedReviews();
    const updated = [newReview, ...cached].slice(0, MAX_REVIEWS_LIMIT);
    setCachedReviews(updated);
    return { success: false, reviews: updated };
  }
};

/**
 * Menghapus ulasan dari Supabase Storage (Khusus Pemilik dengan PIN 1995)
 */
export const deleteReviewFromSupabase = async (
  reviewId: string
): Promise<{ success: boolean; reviews: ReviewItem[] }> => {
  try {
    const currentList = await fetchReviewsFromSupabase();
    let updatedList = currentList.filter((r) => r.id !== reviewId);

    // Jika kosong, sediakan ulasan default
    if (updatedList.length === 0) {
      updatedList = [...INITIAL_4_REVIEWS];
    }

    const { error } = await supabase.storage
      .from('sinki-media')
      .upload(REVIEWS_FILE_NAME, JSON.stringify(updatedList, null, 2), {
        contentType: 'application/json',
        upsert: true,
      });

    if (error) {
      console.error('Failed to update Supabase after deleting review:', error);
    }

    setCachedReviews(updatedList);
    return { success: !error, reviews: updatedList };
  } catch (err) {
    console.error('Exception deleting review:', err);
    const currentList = getCachedReviews();
    const updated = currentList.filter((r) => r.id !== reviewId);
    setCachedReviews(updated);
    return { success: false, reviews: updated };
  }
};

/**
 * Menyukai ulasan (Like) dan menyinkronkannya ke Supabase
 */
export const likeReviewInSupabase = async (
  reviewId: string
): Promise<{ success: boolean; reviews: ReviewItem[] }> => {
  try {
    const currentList = await fetchReviewsFromSupabase();
    const updatedList = currentList.map((r) =>
      r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r
    );

    // Update asynchronous ke Supabase tanpa menghalangi user
    supabase.storage
      .from('sinki-media')
      .upload(REVIEWS_FILE_NAME, JSON.stringify(updatedList, null, 2), {
        contentType: 'application/json',
        upsert: true,
      })
      .catch((e) => console.warn('Supabase like sync notice:', e));

    setCachedReviews(updatedList);
    return { success: true, reviews: updatedList };
  } catch (err) {
    console.error('Exception liking review:', err);
    const currentList = getCachedReviews();
    const updated = currentList.map((r) =>
      r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r
    );
    setCachedReviews(updated);
    return { success: false, reviews: updated };
  }
};

/**
 * Reset ulasan ke 4 ulasan standar SINKI di Supabase (Khusus Pemilik)
 */
export const resetReviewsToDefaultInSupabase = async (): Promise<ReviewItem[]> => {
  try {
    await supabase.storage
      .from('sinki-media')
      .upload(REVIEWS_FILE_NAME, JSON.stringify(INITIAL_4_REVIEWS, null, 2), {
        contentType: 'application/json',
        upsert: true,
      });
  } catch (e) {
    console.error('Error resetting reviews:', e);
  }
  setCachedReviews(INITIAL_4_REVIEWS);
  return INITIAL_4_REVIEWS;
};
