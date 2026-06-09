import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { calculateDaysTogether, getGreeting, formatDate } from '@/utils';
import { MOOD_OPTIONS, type MoodType } from '@/types';
import MoodPicker from '@/components/MoodPicker';
import CountdownCard from '@/components/CountdownCard';
import QuickEntryGrid from '@/components/QuickEntry';
import SectionHeader from '@/components/SectionHeader';
import DiaryCard from '@/components/DiaryCard';

function HomePage() {
  const couple = useAppStore((state) => state.couple);
  const currentUser = useAppStore((state) => state.currentUser);
  const anniversaries = useAppStore((state) => state.anniversaries);
  const moodRecords = useAppStore((state) => state.moodRecords);
  const diaries = useAppStore((state) => state.diaries);
  const photos = useAppStore((state) => state.photos);
  const addMoodRecord = useAppStore((state) => state.addMoodRecord);
  const processAllScheduledLetters = useAppStore((state) => state.processAllScheduledLetters);
  const getUnreadActivityCount = useAppStore((state) => state.getUnreadActivityCount);

  useDidShow(() => {
    console.log('[HomePage] Page did show');
    processAllScheduledLetters();
  });

  const daysTogether = useMemo(() => calculateDaysTogether(couple.anniversary), [couple.anniversary]);
  const greeting = getGreeting();
  const today = formatDate(new Date().toISOString(), 'YYYY-MM-DD');

  const todayMoodUser1 = moodRecords.find(
    (r) => r.date === today && r.userId === couple.user1.id
  );
  const todayMoodUser2 = moodRecords.find(
    (r) => r.date === today && r.userId === couple.user2.id
  );

  const getMoodLabel = (mood?: MoodType) => {
    if (!mood) return '还没有打卡心情';
    return MOOD_OPTIONS.find((o) => o.type === mood)?.label || '';
  };

  const getMoodEmoji = (mood?: MoodType) => {
    if (!mood) return '🤔';
    return MOOD_OPTIONS.find((o) => o.type === mood)?.emoji || '😊';
  };

  const handleMoodChange = (mood: MoodType) => {
    const newRecord = {
      id: `mood-${Date.now()}`,
      date: today,
      mood,
      userId: currentUser.id,
      note: ''
    };
    addMoodRecord(newRecord);
    Taro.showToast({ title: '心情已记录 💕', icon: 'none' });
  };

  const upcomingAnniversaries = anniversaries
    .slice()
    .sort((a, b) => {
      const aDays = Math.abs(new Date(a.date).getTime() - Date.now());
      const bDays = Math.abs(new Date(b.date).getTime() - Date.now());
      return aDays - bDays;
    })
    .slice(0, 3);

  const latestDiary = diaries[0];
  const unlockedPrivateDiaryIds = useAppStore((s) => s.unlockedPrivateDiaryIds);
  const unreadActivity = getUnreadActivityCount(currentUser.id);

  const latestCapsule = useMemo(() => {
    const userMap = { [couple.user1.id]: couple.user1, [couple.user2.id]: couple.user2 };
    const map = new Map<
      string,
      {
        date: string;
        diaries: { id: string; title: string; excerpt: string; isPrivate: boolean; authorName: string; authorAvatar?: string }[];
        photos: { id: string; url: string }[];
        anniversaries: { id: string; title: string; emoji?: string }[];
        moods: { userId: string; userName: string; userAvatar?: string; mood: string; note?: string }[];
        summary: string;
      }
    >();
    const ensure = (date: string) => {
      if (!date) return undefined as any;
      if (!map.has(date)) {
        map.set(date, { date, diaries: [], photos: [], anniversaries: [], moods: [], summary: '' });
      }
      return map.get(date)!;
    };
    const extractDate = (s: string) => {
      if (!s) return '';
      const d = new Date(s.replace(/-/g, '/'));
      if (isNaN(d.getTime())) return s.slice(0, 10);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    diaries.forEach((d) => {
      const cap = ensure(extractDate(d.createdAt));
      if (!cap?.date) return;
      const isUnlocked = unlockedPrivateDiaryIds.includes(d.id);
      const author = userMap[d.authorId as keyof typeof userMap];
      cap.diaries.push({
        id: d.id,
        title: d.isPrivate && !isUnlocked ? '🔒 私密日记' : d.title,
        excerpt: d.isPrivate && !isUnlocked ? '解锁后查看' : d.content.replace(/\s+/g, ' ').slice(0, 24),
        isPrivate: d.isPrivate,
        authorName: d.authorName,
        authorAvatar: author?.avatar
      });
    });
    photos.forEach((p) => {
      const cap = ensure(extractDate(p.uploadedAt));
      if (!cap?.date) return;
      cap.photos.push({ id: p.id, url: p.url });
    });
    anniversaries.forEach((a) => {
      const cap = ensure(extractDate(a.date));
      if (!cap?.date) return;
      cap.anniversaries.push({ id: a.id, title: a.title, emoji: a.emoji });
    });
    moodRecords.forEach((m) => {
      const cap = ensure(m.date);
      if (!cap?.date) return;
      const user = userMap[m.userId as keyof typeof userMap];
      cap.moods.push({ userId: m.userId, userName: user?.name || 'TA', userAvatar: user?.avatar, mood: m.mood, note: m.note });
    });
    const list = Array.from(map.values());
    list.forEach((c) => {
      const parts = [];
      if (c.diaries.length) parts.push(`${c.diaries.length}📝`);
      if (c.photos.length) parts.push(`${c.photos.length}📷`);
      if (c.anniversaries.length) parts.push(`${c.anniversaries.length}🎂`);
      if (c.moods.length) parts.push(`${c.moods.length}🌈`);
      c.summary = parts.join('  ') || '还没有内容';
    });
    list.sort((a, b) => (a.date < b.date ? 1 : -1));
    return list[0];
  }, [diaries, photos, anniversaries, moodRecords, couple.user1, couple.user2, unlockedPrivateDiaryIds]);

  const latestCapsuleDate = latestCapsule?.date || '';

  const handleActivity = () => {
    Taro.navigateTo({ url: '/pages/activity/index' });
  };

  const handleTimeCapsule = () => {
    const url = latestCapsuleDate
      ? `/pages/time-capsule/index?date=${latestCapsuleDate}`
      : '/pages/time-capsule/index';
    Taro.navigateTo({ url });
  };

  const handleOpenCapsuleDiary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Taro.navigateTo({ url: `/pages/diary-detail/index?id=${id}` });
  };

  return (
    <ScrollView scrollY className={styles.container} refresherEnabled>
      <View className={styles.hero}>
        <Text className={styles.heroGreeting}>{greeting}~</Text>
        <View className={styles.heroDays}>
          <Text className={styles.heroDaysNumber}>{daysTogether}</Text>
          <Text className={styles.heroDaysUnit}>天</Text>
        </View>
        <Text className={styles.heroTitle}>我们已经在一起这么久啦</Text>
        <Text className={styles.heroSubtitle}>
          从 {couple.anniversary} 开始，每一个平凡的日子都闪闪发光 ✨
        </Text>
      </View>

      {unreadActivity > 0 && (
        <View className={styles.unreadBanner} onClick={handleActivity}>
          <View className={styles.unreadBannerLeft}>
            <Text className={styles.unreadBannerIcon}>💫</Text>
            <View>
              <Text className={styles.unreadBannerTitle}>你有 {unreadActivity} 条新动态</Text>
              <Text className={styles.unreadBannerSub}>点我查看 TA 为你做了什么 💕</Text>
            </View>
          </View>
          <Text className={styles.unreadBannerArrow}>›</Text>
        </View>
      )}

      <View className={styles.coupleRow}>
        <View className={styles.coupleUser}>
          <Image src={couple.user1.avatar} className={styles.coupleAvatar} mode="aspectFill" />
          <View className={styles.coupleInfo}>
            <Text className={styles.coupleName}>{couple.user1.name}</Text>
            <Text className={styles.coupleMood}>
              {getMoodEmoji(todayMoodUser1?.mood as MoodType)} {getMoodLabel(todayMoodUser1?.mood as MoodType)}
            </Text>
          </View>
        </View>
        <View className={styles.coupleHeart}>💞</View>
        <View className={styles.coupleUser} style={{ justifyContent: 'flex-end' }}>
          <View className={styles.coupleInfo} style={{ alignItems: 'flex-end' }}>
            <Text className={styles.coupleName}>{couple.user2.name}</Text>
            <Text className={styles.coupleMood}>
              {getMoodEmoji(todayMoodUser2?.mood as MoodType)} {getMoodLabel(todayMoodUser2?.mood as MoodType)}
            </Text>
          </View>
          <Image src={couple.user2.avatar} className={styles.coupleAvatar} mode="aspectFill" />
        </View>
      </View>

      <SectionHeader title="今日心情" subtitle="打卡今天的心情吧~" showMore={false} />
      <View className={styles.moodCard}>
        <Text className={styles.moodTitle}>{currentUser.name}，今天心情怎么样？</Text>
        <MoodPicker
          value={moodRecords.find((r) => r.date === today && r.userId === currentUser.id)?.mood as MoodType}
          onChange={handleMoodChange}
        />
      </View>

      <SectionHeader title="快捷入口" showMore={false} />
      <View className={styles.quickCard}>
        <QuickEntryGrid />
      </View>

      <View className={styles.collabRow}>
        <View className={styles.collabCard} onClick={handleActivity}>
          {unreadActivity > 0 && (
            <View className={styles.collabBadge}>
              <Text className={styles.collabBadgeText}>
                {unreadActivity > 99 ? '99+' : unreadActivity}
              </Text>
            </View>
          )}
          <Text className={styles.collabIcon}>💫</Text>
          <Text className={styles.collabTitle}>动态中心</Text>
          <Text className={styles.collabSub}>
            {unreadActivity > 0 ? `${unreadActivity}条新动态` : '暂无新动态'}
          </Text>
        </View>
        <View className={styles.collabCard} onClick={handleTimeCapsule}>
          <Text className={styles.collabIcon}>🗓️</Text>
          <Text className={styles.collabTitle}>全部回忆</Text>
          <Text className={styles.collabSub}>按天浏览每一天</Text>
        </View>
      </View>

      {latestCapsule && (
        <View className={styles.latestMemory} onClick={handleTimeCapsule}>
          <View className={styles.latestMemoryHeader}>
            <View>
              <Text className={styles.latestMemoryLabel}>💗 最近回忆</Text>
              <Text className={styles.latestMemoryDate}>
                {latestCapsuleDate.slice(0, 4)}年
                {Number(latestCapsuleDate.slice(5, 7))}月
                {Number(latestCapsuleDate.slice(8, 10))}日 · {latestCapsule.summary}
              </Text>
            </View>
            <View className={styles.latestMemoryBtn}>
              <Text style={{ fontSize: '24rpx', color: '#FF6B9D', fontWeight: 600 }}>进入 ›</Text>
            </View>
          </View>

          {latestCapsule.moods.length > 0 && (
            <View className={styles.latestMemoryRow}>
              {latestCapsule.moods.map((m, i) => {
                const info = MOOD_OPTIONS.find((o) => o.type === m.mood);
                return (
                  <View key={i} className={styles.memoryMood}>
                    <Image src={m.userAvatar} className={styles.memoryAvatar} mode="aspectFill" />
                    <View className={styles.memoryMoodBubble} style={{ background: `${info?.color || '#888'}22` }}>
                      <Text style={{ fontSize: '28rpx' }}>{info?.emoji || '😊'}</Text>
                      <Text style={{ fontSize: '22rpx', color: info?.color || '#888', fontWeight: 500 }}>
                        {info?.label || m.mood}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {latestCapsule.anniversaries.length > 0 && (
            <View className={styles.latestMemoryRow}>
              {latestCapsule.anniversaries.map((a) => (
                <View key={a.id} className={styles.memoryAnniv}>
                  <Text style={{ fontSize: '28rpx' }}>{a.emoji || '🎀'}</Text>
                  <Text className={styles.memoryAnnivText}>{a.title}</Text>
                </View>
              ))}
            </View>
          )}

          {latestCapsule.diaries.length > 0 && (
            <View className={styles.latestMemoryRow}>
              {latestCapsule.diaries.slice(0, 2).map((d) => (
                <View
                  key={d.id}
                  className={styles.memoryDiary}
                  onClick={(e) => handleOpenCapsuleDiary(d.id, e)}
                >
                  <Image src={d.authorAvatar} className={styles.memoryAvatar} mode="aspectFill" />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text className={styles.memoryDiaryTitle} numberOfLines={1}>
                      {d.title}
                    </Text>
                    <Text className={styles.memoryDiaryExcerpt} numberOfLines={1}>
                      {d.excerpt}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {latestCapsule.photos.length > 0 && (
            <View className={styles.memoryPhotos}>
              {latestCapsule.photos.slice(0, 5).map((p) => (
                <Image key={p.id} src={p.url} className={styles.memoryPhoto} mode="aspectFill" />
              ))}
              {latestCapsule.photos.length > 5 && (
                <View className={styles.memoryPhotoMore}>
                  <Text style={{ color: '#fff', fontWeight: 700, fontSize: '26rpx' }}>
                    +{latestCapsule.photos.length - 5}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <SectionHeader
        title="距离提醒"
        subtitle="重要的日子不能忘"
        actionText="全部纪念日"
        actionPath="/pages/anniversary/index"
      />
      <View className={styles.countdownList}>
        {upcomingAnniversaries.map((anniv) => (
          <CountdownCard
            key={anniv.id}
            title={anniv.title}
            date={anniv.date}
            repeat={anniv.repeat}
            emoji={anniv.emoji}
            type={anniv.type}
            blessing={anniv.blessing}
          />
        ))}
      </View>

      <SectionHeader
        title="最近日记"
        actionText="查看全部"
        actionPath="/pages/diary/index"
      />
      {latestDiary ? (
        <DiaryCard diary={latestDiary} />
      ) : (
        <View className={styles.moodTip}>还没有写日记哦，快去记录吧~</View>
      )}
    </ScrollView>
  );
}

export default HomePage;
