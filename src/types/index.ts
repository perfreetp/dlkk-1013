export interface User {
  id: string;
  name: string;
  avatar: string;
  birthday: string;
  gender: 'male' | 'female';
}

export interface Couple {
  id: string;
  user1: User;
  user2: User;
  anniversary: string;
  loveStory?: string;
}

export type MoodType = 'happy' | 'calm' | 'sad' | 'angry' | 'love';

export interface MoodRecord {
  id: string;
  date: string;
  mood: MoodType;
  userId: string;
  note?: string;
}

export type DiaryFieldChanged = 'title' | 'content' | 'isPrivate' | 'tags' | 'images' | 'coEditors';

export interface DiaryEditSnapshot {
  title?: string;
  content?: string;
  isPrivate?: boolean;
  tags?: string[];
  images?: string[];
  coEditors?: string[];
}

export interface DiaryEditRecord {
  id: string;
  editorId: string;
  editorName: string;
  editedAt: string;
  fieldsChanged: DiaryFieldChanged[];
  summary: string;
  before?: DiaryEditSnapshot;
  after?: DiaryEditSnapshot;
  notifyPartner?: boolean;
}

export type ActivityType =
  | 'diary_edited'
  | 'photo_uploaded'
  | 'photo_favorited'
  | 'wish_claimed'
  | 'letter_read';

export interface ActivityRecord {
  id: string;
  type: ActivityType;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  targetId: string;
  targetTitle: string;
  detail?: string;
  createdAt: string;
  readBy: string[];
}

export interface Diary {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  coEditors?: string[];
  editHistory?: DiaryEditRecord[];
}

export interface Photo {
  id: string;
  url: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  isFavorite: boolean;
  groupId?: string;
}

export interface PhotoGroup {
  id: string;
  name: string;
  cover: string;
  photoCount: number;
  createdAt: string;
  description?: string;
}

export interface Anniversary {
  id: string;
  title: string;
  date: string;
  type: 'countdown' | 'memorial';
  repeat: 'none' | 'yearly' | 'monthly';
  emoji?: string;
  remind: boolean;
  blessing?: string;
}

export interface Wish {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  claimedBy?: string;
  claimedByName?: string;
  status: 'pending' | 'claimed' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Letter {
  id: string;
  title: string;
  content: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  createdAt: string;
  scheduledSendTime?: string;
  isSent: boolean;
  isRead: boolean;
  readAt?: string;
}

export type NotifyType = 'diary_edited' | 'photo_favorited' | 'wish_claimed' | 'letter_read';

export interface NotificationPrefs {
  diary_edited: boolean;
  photo_favorited: boolean;
  wish_claimed: boolean;
  letter_read: boolean;
}

export interface Settings {
  accessPassword?: string;
  isLocked: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  lastBackupAt?: string;
  isSealed: boolean;
  sealedAt?: string;
  notifyPrefs: NotificationPrefs;
}

export interface QuickEntry {
  key: string;
  title: string;
  emoji: string;
  pagePath?: string;
  color: string;
}

export const MOOD_OPTIONS: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'happy', emoji: '😊', label: '开心', color: '#FF9800' },
  { type: 'love', emoji: '🥰', label: '恋爱', color: '#FF6B9D' },
  { type: 'calm', emoji: '😌', label: '平静', color: '#4CAF50' },
  { type: 'sad', emoji: '😢', label: '难过', color: '#2196F3' },
  { type: 'angry', emoji: '😤', label: '生气', color: '#F44336' }
];
