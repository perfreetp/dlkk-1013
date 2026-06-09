import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type {
  Couple, Diary, Photo, PhotoGroup, Anniversary, Wish, Letter, MoodRecord, Settings, User,
  DiaryEditRecord, DiaryFieldChanged
} from '@/types';
import {
  mockCouple, mockDiaries, mockPhotos, mockPhotoGroups,
  mockAnniversaries, mockWishes, mockLetters, mockMoodRecords
} from '@/data/mock';

const STORAGE_KEY = 'couple_space_data_v1';

export interface PersistedData {
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
  initializedAt: string;
}

const loadFromStorage = (): Partial<PersistedData> => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedData;
      console.log('[Store] Loaded from storage, diaries:', parsed.diaries?.length, 'letters:', parsed.letters?.length);
      return parsed;
    }
  } catch (e) {
    console.error('[Store] Failed to load from storage:', e);
  }
  return {};
};

const saveToStorage = (state: Partial<PersistedData>) => {
  try {
    const data: PersistedData = {
      currentUser: state.currentUser || mockCouple.user1,
      couple: state.couple || mockCouple,
      diaries: state.diaries || mockDiaries,
      photos: state.photos || mockPhotos,
      photoGroups: state.photoGroups || mockPhotoGroups,
      anniversaries: state.anniversaries || mockAnniversaries,
      wishes: state.wishes || mockWishes,
      letters: state.letters || mockLetters,
      moodRecords: state.moodRecords || mockMoodRecords,
      settings: state.settings || { isLocked: false, backupFrequency: 'weekly', isSealed: false },
      initializedAt: new Date().toISOString()
    };
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data));
    console.log('[Store] Saved to storage');
  } catch (e) {
    console.error('[Store] Failed to save to storage:', e);
  }
};

const processScheduledLetters = (letters: Letter[]): Letter[] => {
  const now = Date.now();
  let changed = false;
  const updated = letters.map((l) => {
    if (!l.isSent && l.scheduledSendTime) {
      const sendTime = new Date(l.scheduledSendTime.replace(/-/g, '/')).getTime();
      if (sendTime <= now) {
        changed = true;
        console.log('[Store] Delivering scheduled letter:', l.id, l.title);
        return { ...l, isSent: true };
      }
    }
    return l;
  });
  return changed ? updated : letters;
};

const nowString = (): string => new Date().toISOString().replace('T', ' ').slice(0, 19);

const genId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const computeDiaryDiff = (oldD: Diary, newD: Partial<Diary>): DiaryFieldChanged[] => {
  const fields: DiaryFieldChanged[] = [];
  if (newD.title !== undefined && newD.title !== oldD.title) fields.push('title');
  if (newD.content !== undefined && newD.content !== oldD.content) fields.push('content');
  if (newD.isPrivate !== undefined && newD.isPrivate !== oldD.isPrivate) fields.push('isPrivate');
  if (newD.tags && JSON.stringify(newD.tags) !== JSON.stringify(oldD.tags)) fields.push('tags');
  if (newD.images && JSON.stringify(newD.images) !== JSON.stringify(oldD.images || [])) fields.push('images');
  if (newD.coEditors && JSON.stringify(newD.coEditors) !== JSON.stringify(oldD.coEditors || [])) fields.push('coEditors');
  return fields;
};

const fieldLabel: Record<DiaryFieldChanged, string> = {
  title: '标题',
  content: '正文',
  isPrivate: '私密状态',
  tags: '标签',
  images: '图片',
  coEditors: '共同编辑'
};

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
  isStorageLoaded: boolean;
  hasVerifiedAccess: boolean;
  unlockedPrivateDiaryIds: string[];

  setCurrentUser: (user: User) => void;
  switchUser: (userId: string) => void;
  addDiary: (diary: Diary) => void;
  updateDiary: (id: string, diary: Partial<Diary>, editorId?: string, editorName?: string) => void;
  deleteDiary: (id: string) => void;
  unlockPrivateDiary: (id: string) => void;
  isPrivateDiaryUnlocked: (id: string) => boolean;

  addPhoto: (photo: Photo) => void;
  addPhotos: (photos: Photo[]) => void;
  togglePhotoFavorite: (id: string) => void;
  updatePhotoGroup: (id: string, patch: Partial<PhotoGroup>) => void;
  refreshPhotoGroupStats: (groupId?: string) => void;

  addAnniversary: (anniv: Anniversary) => void;
  updateAnniversary: (id: string, anniv: Partial<Anniversary>) => void;
  deleteAnniversary: (id: string) => void;
  addWish: (wish: Wish) => void;
  claimWish: (id: string, userId: string, userName: string) => void;
  completeWish: (id: string) => void;
  deleteWish: (id: string) => void;
  addLetter: (letter: Letter) => void;
  markLetterRead: (id: string) => void;
  processAllScheduledLetters: () => void;
  addMoodRecord: (record: MoodRecord) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setSelectedTab: (tab: string) => void;
  setHasVerifiedAccess: (val: boolean) => void;
  forcePersist: () => void;
  exportBackupData: () => PersistedData;
  restoreFromBackup: (data: PersistedData) => void;
}

const persisted = loadFromStorage();
const initialLetters = processScheduledLetters(persisted.letters || mockLetters);

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: persisted.currentUser || mockCouple.user1,
  couple: persisted.couple || mockCouple,
  diaries: persisted.diaries || mockDiaries,
  photos: persisted.photos || mockPhotos,
  photoGroups: persisted.photoGroups || mockPhotoGroups,
  anniversaries: persisted.anniversaries || mockAnniversaries,
  wishes: persisted.wishes || mockWishes,
  letters: initialLetters,
  moodRecords: persisted.moodRecords || mockMoodRecords,
  settings: persisted.settings || {
    isLocked: false,
    backupFrequency: 'weekly',
    isSealed: false
  },
  selectedTab: 'home',
  isStorageLoaded: true,
  hasVerifiedAccess: false,
  unlockedPrivateDiaryIds: [],

  forcePersist: () => {
    const s = get();
    saveToStorage({
      currentUser: s.currentUser,
      couple: s.couple,
      diaries: s.diaries,
      photos: s.photos,
      photoGroups: s.photoGroups,
      anniversaries: s.anniversaries,
      wishes: s.wishes,
      letters: s.letters,
      moodRecords: s.moodRecords,
      settings: s.settings
    });
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
    get().forcePersist();
  },

  switchUser: (userId) => {
    const { couple, currentUser } = get();
    let target: User = currentUser;
    if (couple.user1.id === userId) target = couple.user1;
    else if (couple.user2.id === userId) target = couple.user2;
    set({ currentUser: target });
    get().forcePersist();
  },

  addDiary: (diary) => {
    set((state) => ({ diaries: [diary, ...state.diaries] }));
    get().forcePersist();
  },

  updateDiary: (id, patch, editorId, editorName) => {
    const state = get();
    const original = state.diaries.find((d) => d.id === id);
    if (!original) return;
    const fields = computeDiaryDiff(original, patch);
    let newEditHistory: DiaryEditRecord[] = original.editHistory ? [...original.editHistory] : [];
    if (fields.length > 0 && editorId && editorName) {
      const summary = fields.map((f) => fieldLabel[f]).join('、');
      newEditHistory = [
        {
          id: genId(),
          editorId,
          editorName,
          editedAt: nowString(),
          fieldsChanged: fields,
          summary: `修改了${summary}`
        },
        ...newEditHistory
      ];
    }
    set((s) => ({
      diaries: s.diaries.map((d) =>
        d.id === id
          ? { ...d, ...patch, updatedAt: nowString(), editHistory: newEditHistory }
          : d
      )
    }));
    get().forcePersist();
  },

  deleteDiary: (id) => {
    set((state) => ({ diaries: state.diaries.filter((d) => d.id !== id) }));
    get().forcePersist();
  },

  unlockPrivateDiary: (id) => {
    set((state) => ({
      unlockedPrivateDiaryIds: state.unlockedPrivateDiaryIds.includes(id)
        ? state.unlockedPrivateDiaryIds
        : [...state.unlockedPrivateDiaryIds, id]
    }));
  },

  isPrivateDiaryUnlocked: (id) => {
    return get().unlockedPrivateDiaryIds.includes(id);
  },

  addPhoto: (photo) => {
    set((state) => ({ photos: [photo, ...state.photos] }));
    if (photo.groupId) get().refreshPhotoGroupStats(photo.groupId);
    else get().forcePersist();
  },

  addPhotos: (photos) => {
    if (photos.length === 0) return;
    set((state) => ({ photos: [...photos, ...state.photos] }));
    const groupIds = Array.from(new Set(photos.map((p) => p.groupId).filter(Boolean) as string[]));
    if (groupIds.length > 0) {
      groupIds.forEach((gid) => get().refreshPhotoGroupStats(gid));
    } else {
      get().forcePersist();
    }
  },

  togglePhotoFavorite: (id) => {
    set((state) => ({
      photos: state.photos.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    }));
    get().forcePersist();
  },

  updatePhotoGroup: (id, patch) => {
    set((state) => ({
      photoGroups: state.photoGroups.map((g) => (g.id === id ? { ...g, ...patch } : g))
    }));
    get().forcePersist();
  },

  refreshPhotoGroupStats: (groupId) => {
    const s = get();
    const groups = groupId ? s.photoGroups.filter((g) => g.id === groupId) : s.photoGroups;
    if (groups.length === 0) {
      s.forcePersist();
      return;
    }
    set((state) => ({
      photoGroups: state.photoGroups.map((g) => {
        const groupPhotos = state.photos.filter((p) => p.groupId === g.id);
        const count = groupPhotos.length;
        const cover = count > 0 ? groupPhotos[0].url : g.cover;
        return { ...g, photoCount: count, cover };
      })
    }));
    get().forcePersist();
  },

  addAnniversary: (anniv) => {
    set((state) => ({ anniversaries: [...state.anniversaries, anniv] }));
    get().forcePersist();
  },

  updateAnniversary: (id, anniv) => {
    set((state) => ({
      anniversaries: state.anniversaries.map((a) => (a.id === id ? { ...a, ...anniv } : a))
    }));
    get().forcePersist();
  },

  deleteAnniversary: (id) => {
    set((state) => ({ anniversaries: state.anniversaries.filter((a) => a.id !== id) }));
    get().forcePersist();
  },

  addWish: (wish) => {
    set((state) => ({ wishes: [wish, ...state.wishes] }));
    get().forcePersist();
  },

  claimWish: (id, userId, userName) => {
    set((state) => ({
      wishes: state.wishes.map((w) =>
        w.id === id ? { ...w, claimedBy: userId, claimedByName: userName, status: 'claimed' } : w
      )
    }));
    get().forcePersist();
  },

  completeWish: (id) => {
    set((state) => ({
      wishes: state.wishes.map((w) =>
        w.id === id
          ? {
              ...w,
              status: 'completed',
              completedAt: new Date().toISOString().slice(0, 10)
            }
          : w
      )
    }));
    get().forcePersist();
  },

  deleteWish: (id) => {
    set((state) => ({ wishes: state.wishes.filter((w) => w.id !== id) }));
    get().forcePersist();
  },

  addLetter: (letter) => {
    set((state) => ({ letters: [letter, ...state.letters] }));
    get().forcePersist();
  },

  markLetterRead: (id) => {
    set((state) => ({
      letters: state.letters.map((l) =>
        l.id === id
          ? {
              ...l,
              isRead: true,
              readAt: nowString()
            }
          : l
      )
    }));
    get().forcePersist();
  },

  processAllScheduledLetters: () => {
    const state = get();
    const processed = processScheduledLetters(state.letters);
    if (processed !== state.letters) {
      set({ letters: processed });
      get().forcePersist();
    }
  },

  addMoodRecord: (record) => {
    set((state) => ({
      moodRecords: [
        record,
        ...state.moodRecords.filter((r) => !(r.date === record.date && r.userId === record.userId))
      ]
    }));
    get().forcePersist();
  },

  updateSettings: (settings) => {
    set((state) => ({ settings: { ...state.settings, ...settings } }));
    get().forcePersist();
  },

  setSelectedTab: (tab) => set({ selectedTab: tab }),

  setHasVerifiedAccess: (val) => set({ hasVerifiedAccess: val }),

  exportBackupData: () => {
    const s = get();
    return {
      currentUser: s.currentUser,
      couple: s.couple,
      diaries: s.diaries,
      photos: s.photos,
      photoGroups: s.photoGroups,
      anniversaries: s.anniversaries,
      wishes: s.wishes,
      letters: s.letters,
      moodRecords: s.moodRecords,
      settings: s.settings,
      initializedAt: new Date().toISOString()
    };
  },

  restoreFromBackup: (data) => {
    if (!data || !data.diaries) return;
    set({
      currentUser: data.currentUser || mockCouple.user1,
      couple: data.couple || mockCouple,
      diaries: data.diaries || [],
      photos: data.photos || [],
      photoGroups: data.photoGroups || [],
      anniversaries: data.anniversaries || [],
      wishes: data.wishes || [],
      letters: processScheduledLetters(data.letters || []),
      moodRecords: data.moodRecords || [],
      settings: data.settings || { isLocked: false, backupFrequency: 'weekly', isSealed: false },
      unlockedPrivateDiaryIds: [],
      hasVerifiedAccess: false
    });
    get().forcePersist();
  }
}));
