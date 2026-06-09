import dayjs from 'dayjs';
import type {
  Couple, Diary, Photo, PhotoGroup, Anniversary, Wish, Letter, MoodRecord
} from '@/types';

export const mockCouple: Couple = {
  id: 'couple-001',
  user1: {
    id: 'user-001',
    name: '小甜心',
    avatar: 'https://picsum.photos/id/64/200/200',
    birthday: '1998-05-20',
    gender: 'female'
  },
  user2: {
    id: 'user-002',
    name: '大宝贝',
    avatar: 'https://picsum.photos/id/91/200/200',
    birthday: '1997-08-15',
    gender: 'male'
  },
  anniversary: '2022-02-14',
  loveStory: '在最美的年华遇见你，是我一生的幸运'
};

export const mockMoodRecords: MoodRecord[] = [
  {
    id: 'mood-001',
    date: dayjs().format('YYYY-MM-DD'),
    mood: 'love',
    userId: 'user-001',
    note: '今天和宝贝去看电影啦，超开心！'
  },
  {
    id: 'mood-002',
    date: dayjs().format('YYYY-MM-DD'),
    mood: 'happy',
    userId: 'user-002',
    note: '收到宝贝的爱心午餐'
  },
  {
    id: 'mood-003',
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    mood: 'calm',
    userId: 'user-001',
    note: '一起在家看剧的夜晚'
  }
];

export const mockDiaries: Diary[] = [
  {
    id: 'diary-001',
    title: '第一次牵手的那天',
    content: '还记得那天晚上，在公园的长椅上，你悄悄牵起了我的手。那一刻，心跳加速，感觉整个世界都静止了。你的手暖暖的，给了我满满的安全感...',
    authorId: 'user-001',
    authorName: '小甜心',
    tags: ['回忆', '心动'],
    isPrivate: false,
    createdAt: '2022-02-20 18:30:00',
    updatedAt: '2022-02-20 18:30:00',
    images: ['https://picsum.photos/id/1018/750/500'],
    coEditors: ['user-002']
  },
  {
    id: 'diary-002',
    title: '一起旅行 - 厦门',
    content: '鼓浪屿的海风、厦门大学的凤凰花、曾厝垵的小吃... 和你在一起的每一天都像在度假。',
    authorId: 'user-002',
    authorName: '大宝贝',
    tags: ['旅行', '厦门'],
    isPrivate: false,
    createdAt: '2023-07-15 22:00:00',
    updatedAt: '2023-07-15 22:00:00',
    images: ['https://picsum.photos/id/1015/750/500', 'https://picsum.photos/id/1036/750/500']
  },
  {
    id: 'diary-003',
    title: '关于未来的小秘密',
    content: '今天偷偷幻想了一下我们未来的家，要有一个大大的阳台，养一只猫一只狗，还有...',
    authorId: 'user-001',
    authorName: '小甜心',
    tags: ['未来', '私密'],
    isPrivate: true,
    createdAt: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 'diary-004',
    title: '平凡又幸福的周末',
    content: '周六早上一起赖床，中午一起做饭，下午窝在沙发看电影。平凡的日子因为有你而变得不平凡。',
    authorId: 'user-002',
    authorName: '大宝贝',
    tags: ['日常', '幸福'],
    isPrivate: false,
    createdAt: dayjs().subtract(1, 'week').format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().subtract(1, 'week').format('YYYY-MM-DD HH:mm:ss'),
    images: ['https://picsum.photos/id/225/750/500']
  },
  {
    id: 'diary-005',
    title: '今天有点小生气',
    content: '他居然忘记了我们的月纪念日！虽然事后道歉了，但是本宝宝还是很生气！不过看到他买了我最爱吃的草莓蛋糕，勉强原谅他吧~',
    authorId: 'user-001',
    authorName: '小甜心',
    tags: ['小别扭', '和好'],
    isPrivate: false,
    createdAt: dayjs().subtract(2, 'week').format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().subtract(2, 'week').format('YYYY-MM-DD HH:mm:ss')
  }
];

export const mockPhotoGroups: PhotoGroup[] = [
  {
    id: 'group-001',
    name: '日常点滴',
    cover: 'https://picsum.photos/id/64/300/300',
    photoCount: 36,
    createdAt: '2022-02-14',
    description: '记录我们每一天的小幸福'
  },
  {
    id: 'group-002',
    name: '旅行回忆',
    cover: 'https://picsum.photos/id/1015/300/300',
    photoCount: 128,
    createdAt: '2022-05-01',
    description: '一起看过的风景'
  },
  {
    id: 'group-003',
    name: '美食合集',
    cover: 'https://picsum.photos/id/292/300/300',
    photoCount: 85,
    createdAt: '2022-03-10',
    description: '一起吃过的好吃的'
  },
  {
    id: 'group-004',
    name: '节日纪念',
    cover: 'https://picsum.photos/id/431/300/300',
    photoCount: 24,
    createdAt: '2022-02-14',
    description: '每个重要的日子'
  }
];

export const mockPhotos: Photo[] = [
  { id: 'photo-001', url: 'https://picsum.photos/id/1015/400/400', description: '海边的日落', uploadedBy: 'user-001', uploadedAt: '2023-07-15', isFavorite: true, groupId: 'group-002' },
  { id: 'photo-002', url: 'https://picsum.photos/id/1018/400/400', description: '山间的清晨', uploadedBy: 'user-002', uploadedAt: '2023-07-16', isFavorite: true, groupId: 'group-002' },
  { id: 'photo-003', url: 'https://picsum.photos/id/292/400/400', description: '一起做的晚餐', uploadedBy: 'user-001', uploadedAt: '2023-07-20', isFavorite: false, groupId: 'group-003' },
  { id: 'photo-004', url: 'https://picsum.photos/id/326/400/400', description: '周末早午餐', uploadedBy: 'user-002', uploadedAt: '2023-07-22', isFavorite: false, groupId: 'group-003' },
  { id: 'photo-005', url: 'https://picsum.photos/id/1027/400/400', description: '自拍一张', uploadedBy: 'user-001', uploadedAt: '2023-07-25', isFavorite: true, groupId: 'group-001' },
  { id: 'photo-006', url: 'https://picsum.photos/id/1036/400/400', description: '旅途风景', uploadedBy: 'user-002', uploadedAt: '2023-07-28', isFavorite: false, groupId: 'group-002' },
  { id: 'photo-007', url: 'https://picsum.photos/id/401/400/400', description: '下午茶时光', uploadedBy: 'user-001', uploadedAt: '2023-08-01', isFavorite: false, groupId: 'group-003' },
  { id: 'photo-008', url: 'https://picsum.photos/id/570/400/400', description: '在家做饭', uploadedBy: 'user-002', uploadedAt: '2023-08-05', isFavorite: true, groupId: 'group-001' }
];

export const mockAnniversaries: Anniversary[] = [
  {
    id: 'anniv-001',
    title: '在一起纪念日',
    date: '2022-02-14',
    type: 'memorial',
    repeat: 'yearly',
    emoji: '💕',
    remind: true,
    blessing: '愿我们的爱情，岁岁年年，深情不减'
  },
  {
    id: 'anniv-002',
    title: '小甜心生日',
    date: '1998-05-20',
    type: 'memorial',
    repeat: 'yearly',
    emoji: '🎂',
    remind: true,
    blessing: '愿你永远是我的小宝贝，开心每一天'
  },
  {
    id: 'anniv-003',
    title: '大宝贝生日',
    date: '1997-08-15',
    type: 'memorial',
    repeat: 'yearly',
    emoji: '🎈',
    remind: true,
    blessing: '生日快乐，我的大英雄'
  },
  {
    id: 'anniv-004',
    title: '1000天纪念日',
    date: dayjs('2022-02-14').add(1000, 'day').format('YYYY-MM-DD'),
    type: 'countdown',
    repeat: 'none',
    emoji: '🎉',
    remind: true,
    blessing: '一千个日夜，一千份爱'
  },
  {
    id: 'anniv-005',
    title: '第一次旅行',
    date: '2022-05-01',
    type: 'memorial',
    repeat: 'yearly',
    emoji: '✈️',
    remind: true,
    blessing: '世界那么大，一起去看看'
  }
];

export const mockWishes: Wish[] = [
  {
    id: 'wish-001',
    title: '一起去看极光',
    description: '希望有生之年能和你一起去冰岛看极光，想想就浪漫~',
    createdBy: 'user-001',
    status: 'pending',
    priority: 'high',
    createdAt: '2023-01-15'
  },
  {
    id: 'wish-002',
    title: '学做一道新菜',
    description: '每周学做一道新菜，一年后我们就是美食家啦',
    createdBy: 'user-002',
    claimedBy: 'user-001',
    claimedByName: '小甜心',
    status: 'claimed',
    priority: 'medium',
    createdAt: '2023-02-20'
  },
  {
    id: 'wish-003',
    title: '养一只小猫',
    description: '以后我们要养一只橘猫，名字叫橙子',
    createdBy: 'user-001',
    claimedBy: 'user-002',
    claimedByName: '大宝贝',
    status: 'completed',
    priority: 'medium',
    createdAt: '2022-12-01',
    completedAt: '2023-06-18'
  },
  {
    id: 'wish-004',
    title: '读50本书',
    description: '2024年一起读50本书，每周至少一本',
    createdBy: 'user-002',
    status: 'pending',
    priority: 'low',
    createdAt: '2024-01-01'
  },
  {
    id: 'wish-005',
    title: '周末去野餐',
    description: '找一个阳光明媚的周末，带上好吃的去公园野餐',
    createdBy: 'user-001',
    claimedBy: 'user-002',
    claimedByName: '大宝贝',
    status: 'claimed',
    priority: 'low',
    deadline: dayjs().add(1, 'week').format('YYYY-MM-DD'),
    createdAt: dayjs().format('YYYY-MM-DD')
  },
  {
    id: 'wish-006',
    title: '买一对情侣对戒',
    description: '等纪念日的时候，买一对我们都喜欢的对戒',
    createdBy: 'user-001',
    claimedBy: 'user-002',
    claimedByName: '大宝贝',
    status: 'completed',
    priority: 'high',
    createdAt: '2023-02-01',
    completedAt: '2023-02-14'
  }
];

export const mockLetters: Letter[] = [
  {
    id: 'letter-001',
    title: '给亲爱的你',
    content: '亲爱的，谢谢你一直以来的包容和疼爱。和你在一起的每一天，我都觉得自己是世界上最幸福的人。未来的路还很长，我们一起慢慢走。',
    fromUserId: 'user-001',
    fromUserName: '小甜心',
    toUserId: 'user-002',
    createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
    isSent: true,
    isRead: true,
    readAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 'letter-002',
    title: '520快乐',
    content: '宝贝，520快乐！虽然平时我不太会说甜言蜜语，但你要知道，你是我这辈子最爱的人。',
    fromUserId: 'user-002',
    fromUserName: '大宝贝',
    toUserId: 'user-001',
    createdAt: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
    scheduledSendTime: dayjs().set('hour', 5).set('minute', 20).format('YYYY-MM-DD HH:mm:ss'),
    isSent: true,
    isRead: true,
    readAt: dayjs().subtract(4, 'day').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 'letter-003',
    title: '结婚一周年惊喜',
    content: '亲爱的老婆，这是我们结婚一周年的纪念日。感谢你愿意和我共度一生，我会用一辈子来好好爱你、照顾你。',
    fromUserId: 'user-002',
    fromUserName: '大宝贝',
    toUserId: 'user-001',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    scheduledSendTime: dayjs().add(10, 'day').set('hour', 0).set('minute', 0).format('YYYY-MM-DD HH:mm:ss'),
    isSent: false,
    isRead: false
  },
  {
    id: 'letter-004',
    title: '晚安',
    content: '今天工作辛苦了，早点休息哦，明天还要一起吃早餐呢~ 爱你，晚安！',
    fromUserId: 'user-001',
    fromUserName: '小甜心',
    toUserId: 'user-002',
    createdAt: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    isSent: true,
    isRead: false
  }
];
