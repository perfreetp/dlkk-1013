import { create } from 'zustand';
import type {
  Couple, Diary, Photo, PhotoGroup, Anniversary, Wish, Letter, MoodRecord, Settings, User
} from '@/types';
import {
  mockCouple, mockDiaries, mockPhotos, mockPhotoGroups,
  mockAnniversaries, mockWishes, mockLetters, mockMoodRecords
} from '@/data/mock';

interface AppState {
  currentUser: User;
  couple: Couple;
  diaries: Diary[];
  photos: Photo[];
  photoGroups: PhotoGroup[];
  anniversaries: Anniversary[];
  wishes: Wish[];
  letters: Letter[];
  moodRecords: MoodRecord[];
  settings: Settings;
  selectedTab: string;

  setCurrentUser: (user: User) => void;
  addDiary: (diary: Diary) => void;
  updateDiary: (id: string, diary: Partial<Diary>) => void;
  deleteDiary: (id: string) => void;
  addPhoto: (photo: Photo) => void;
  togglePhotoFavorite: (id: string) => void;
  addAnniversary: (anniv: Anniversary) => void;
  updateAnniversary: (id: string, anniv: Partial<Anniversary>) => void;
  deleteAnniversary: (id: string) => void;
  addWish: (wish: Wish) => void;
  claimWish: (id: string, userId: string, userName: string) => void;
  completeWish: (id: string) => void;
  deleteWish: (id: string) => void;
  addLetter: (letter: Letter) => void;
  markLetterRead: (id: string) => void;
  addMoodRecord: (record: MoodRecord) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setSelectedTab: (tab: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: mockCouple.user1,
  couple: mockCouple,
  diaries: mockDiaries,
  photos: mockPhotos,
  photoGroups: mockPhotoGroups,
  anniversaries: mockAnniversaries,
  wishes: mockWishes,
  letters: mockLetters,
  moodRecords: mockMoodRecords,
  settings: {
    isLocked: false,
    backupFrequency: 'weekly',
    isSealed: false
  },
  selectedTab: 'home',

  setCurrentUser: (user) => set({ currentUser: user }),

  addDiary: (diary) => set((state) => ({
    diaries: [diary, ...state.diaries]
  })),

  updateDiary: (id, diary) => set((state) => ({
    diaries: state.diaries.map((d) => (d.id === id ? { ...d, ...diary, updatedAt: new Date().toISOString() } : d))
  })),

  deleteDiary: (id) => set((state) => ({
    diaries: state.diaries.filter((d) => d.id !== id)
  })),

  addPhoto: (photo) => set((state) => ({
    photos: [photo, ...state.photos]
  })),

  togglePhotoFavorite: (id) => set((state) => ({
    photos: state.photos.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
  })),

  addAnniversary: (anniv) => set((state) => ({
    anniversaries: [...state.anniversaries, anniv]
  })),

  updateAnniversary: (id, anniv) => set((state) => ({
    anniversaries: state.anniversaries.map((a) => (a.id === id ? { ...a, ...anniv } : a))
  })),

  deleteAnniversary: (id) => set((state) => ({
    anniversaries: state.anniversaries.filter((a) => a.id !== id)
  })),

  addWish: (wish) => set((state) => ({
    wishes: [wish, ...state.wishes]
  })),

  claimWish: (id, userId, userName) => set((state) => ({
    wishes: state.wishes.map((w) => (w.id === id ? { ...w, claimedBy: userId, claimedByName: userName, status: 'claimed' } : w))
  })),

  completeWish: (id) => set((state) => ({
    wishes: state.wishes.map((w) => (w.id === id ? { ...w, status: 'completed', completedAt: new Date().toISOString() } : w))
  })),

  deleteWish: (id) => set((state) => ({
    wishes: state.wishes.filter((w) => w.id !== id)
  })),

  addLetter: (letter) => set((state) => ({
    letters: [letter, ...state.letters]
  })),

  markLetterRead: (id) => set((state) => ({
    letters: state.letters.map((l) => (l.id === id ? { ...l, isRead: true, readAt: new Date().toISOString() } : l))
  })),

  addMoodRecord: (record) => set((state) => ({
    moodRecords: [record, ...state.moodRecords.filter((r) => !(r.date === record.date && r.userId === record.userId))]
  })),

  updateSettings: (settings) => set((state) => ({
    settings: { ...state.settings, ...settings }
  })),

  setSelectedTab: (tab) => set({ selectedTab: tab })
}));
