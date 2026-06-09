import React, { useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import EmptyState from '@/components/EmptyState';
import { MOOD_OPTIONS } from '@/types';

interface DayCapsule {
  date: string;
  diaries: { id: string; title: string; excerpt: string; isPrivate: boolean; authorName: string }[];
  photos: { id: string; url: string; description?: string }[];
  anniversaries: { id: string; title: string; emoji?: string }[];
  moods: { userId: string; userName: string; mood: string; note?: string }[];
  summary: string;
}

function extractDate(str: string) {
  if (!str) return '';
  const s = str.replace(/-/g, '/');
  const d = new Date(s);
  if (isNaN(d.getTime())) return str.slice(0, 10);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(dateStr: string) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
}

function getWeekDay(dateStr: string) {
  if (!dateStr) return '';
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const d = new Date(dateStr.replace(/-/g, '/'));
  return isNaN(d.getTime()) ? '' : weeks[d.getDay()];
}

function getMoodInfo(mood: string) {
  return MOOD_OPTIONS.find((m) => m.type === mood) || { emoji: '❓', label: mood, color: '#888' };
}

function TimeCapsulePage() {
  const router = useRouter();
  const diaries = useAppStore((s) => s.diaries);
  const photos = useAppStore((s) => s.photos);
  const anniversaries = useAppStore((s) => s.anniversaries);
  const moodRecords = useAppStore((s) => s.moodRecords);
  const couple = useAppStore((s) => s.couple);
  const unlockedPrivateDiaryIds = useAppStore((s) => s.unlockedPrivateDiaryIds);
  const processAllScheduledLetters = useAppStore((s) => s.processAllScheduledLetters);

  useDidShow(() => {
    processAllScheduledLetters();
  });

  const userMap = useMemo(
    () => ({ [couple.user1.id]: couple.user1, [couple.user2.id]: couple.user2 }),
    [couple]
  );

  const capsules = useMemo<DayCapsule[]>(() => {
    const map = new Map<string, DayCapsule>();
    const ensure = (date: string): DayCapsule => {
      if (!date) return {} as DayCapsule;
      if (!map.has(date)) {
        map.set(date, {
          date,
          diaries: [],
          photos: [],
          anniversaries: [],
          moods: [],
          summary: ''
        });
      }
      return map.get(date)!;
    };

    diaries.forEach((d) => {
      const date = extractDate(d.createdAt);
      const cap = ensure(date);
      if (!cap.date) return;
      const isUnlocked = unlockedPrivateDiaryIds.includes(d.id);
      cap.diaries.push({
        id: d.id,
        title: d.isPrivate && !isUnlocked ? '🔒 私密日记' : d.title,
        excerpt:
          d.isPrivate && !isUnlocked
            ? '解锁后查看内容'
            : d.content.replace(/\s+/g, ' ').slice(0, 40),
        isPrivate: d.isPrivate,
        authorName: d.authorName
      });
    });

    photos.forEach((p) => {
      const date = extractDate(p.uploadedAt);
      const cap = ensure(date);
      if (!cap.date) return;
      cap.photos.push({ id: p.id, url: p.url, description: p.description });
    });

    anniversaries.forEach((a) => {
      const date = extractDate(a.date);
      const cap = ensure(date);
      if (!cap.date) return;
      cap.anniversaries.push({ id: a.id, title: a.title, emoji: a.emoji });
    });

    moodRecords.forEach((m) => {
      const cap = ensure(m.date);
      if (!cap.date) return;
      const user = userMap[m.userId];
      cap.moods.push({
        userId: m.userId,
        userName: user?.name || 'TA',
        mood: m.mood,
        note: m.note
      });
    });

    const list = Array.from(map.values());
    list.forEach((c) => {
      const parts: string[] = [];
      if (c.diaries.length) parts.push(`${c.diaries.length}篇日记`);
      if (c.photos.length) parts.push(`${c.photos.length}张照片`);
      if (c.anniversaries.length) parts.push(`${c.anniversaries.length}个纪念日`);
      if (c.moods.length) parts.push(`${c.moods.length}份心情`);
      c.summary = parts.join(' · ') || '空白的一天';
    });
    list.sort((a, b) => (a.date < b.date ? 1 : -1));
    return list;
  }, [diaries, photos, anniversaries, moodRecords, userMap, unlockedPrivateDiaryIds]);

  const targetDate = router?.params?.date as string | undefined;

  const scrollToTarget = (date: string) => {
    // 仅在首次进入时滚动
  };

  useDidShow(() => {
    if (targetDate) {
      setTimeout(() => scrollToTarget(targetDate), 50);
    }
  });

  const handleOpenDiary = (d: DayCapsule['diaries'][0]) => {
    Taro.navigateTo({ url: `/pages/diary-detail/index?id=${d.id}` });
  };

  const handleOpenPhotos = (groupId?: string) => {
    if (groupId) Taro.navigateTo({ url: `/pages/album-detail/index?id=${groupId}` });
    else Taro.switchTab({ url: '/pages/album/index' });
  };

  return (
    <ScrollView scrollY className={styles.container} scrollIntoView={targetDate ? `cap-${targetDate}` : ''}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>时间胶囊</Text>
        <Text className={styles.headerSub}>
          把每一天的回忆串起来 · 共 {capsules.length} 天
        </Text>
      </View>

      {capsules.length === 0 ? (
        <EmptyState
          emoji="📅"
          title="还没有回忆哦"
          description="写日记、上传照片、记录心情，它们会按日期出现在这里~"
        />
      ) : (
        <View className={styles.timeline}>
          {capsules.map((cap) => (
            <View key={cap.date} id={`cap-${cap.date}`} className={styles.capsuleBlock}>
              <View className={styles.dateColumn}>
                <View
                  className={classnames(
                    styles.dateDot,
                    targetDate === cap.date && styles.dateDotActive
                  )}
                />
                <View className={styles.dateLine} />
              </View>
              <View className={styles.capsuleCard}>
                <View className={styles.capsuleHeader}>
                  <View>
                    <Text className={styles.dateLabel}>{formatDateLabel(cap.date)}</Text>
                    <Text className={styles.weekLabel}>{getWeekDay(cap.date)}</Text>
                  </View>
                  <View className={styles.summaryBox}>
                    <Text className={styles.summaryText}>{cap.summary}</Text>
                  </View>
                </View>

                {cap.moods.length > 0 && (
                  <View className={styles.section}>
                    <Text className={styles.sectionTitle}>🌈 心情</Text>
                    <View className={styles.moodRow}>
                      {cap.moods.map((m, i) => {
                        const info = getMoodInfo(m.mood);
                        return (
                          <View key={i} className={styles.moodItem}>
                            <View
                              className={styles.moodBubble}
                              style={{ borderColor: `${info.color}55`, backgroundColor: `${info.color}15` }}
                            >
                              <Text className={styles.moodEmoji}>{info.emoji}</Text>
                              <Text className={styles.moodLabel} style={{ color: info.color }}>
                                {info.label}
                              </Text>
                            </View>
                            <Text className={styles.moodUser}>· {m.userName}</Text>
                            {m.note && (
                              <Text className={styles.moodNote} numberOfLines={1}>
                                {m.note}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {cap.anniversaries.length > 0 && (
                  <View className={styles.section}>
                    <Text className={styles.sectionTitle}>🎂 纪念日</Text>
                    <View className={styles.annivRow}>
                      {cap.anniversaries.map((a) => (
                        <View key={a.id} className={styles.annivItem}>
                          <Text className={styles.annivEmoji}>{a.emoji || '🎀'}</Text>
                          <Text className={styles.annivTitle}>{a.title}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {cap.diaries.length > 0 && (
                  <View className={styles.section}>
                    <Text className={styles.sectionTitle}>📝 日记</Text>
                    {cap.diaries.map((d) => (
                      <View
                        key={d.id}
                        className={styles.diaryItem}
                        onClick={() => handleOpenDiary(d)}
                      >
                        <View className={styles.diaryHeader}>
                          <Text className={styles.diaryTitle} numberOfLines={1}>
                            {d.title}
                          </Text>
                          <Text className={styles.diaryAuthor}>· {d.authorName}</Text>
                        </View>
                        <Text className={styles.diaryExcerpt} numberOfLines={2}>
                          {d.excerpt}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {cap.photos.length > 0 && (
                  <View className={styles.section}>
                    <View className={styles.sectionTitleRow}>
                      <Text className={styles.sectionTitle}>📷 照片</Text>
                      <Text
                        className={styles.moreLink}
                        onClick={() => handleOpenPhotos()}
                      >
                        查看全部 ›
                      </Text>
                    </View>
                    <View className={styles.photoGrid}>
                      {cap.photos.slice(0, 6).map((p) => (
                        <Image
                          key={p.id}
                          src={p.url}
                          className={styles.photoThumb}
                          mode="aspectFill"
                        />
                      ))}
                      {cap.photos.length > 6 && (
                        <View
                          className={styles.photoMore}
                          onClick={() => handleOpenPhotos()}
                        >
                          <Text className={styles.photoMoreText}>+{cap.photos.length - 6}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

export default TimeCapsulePage;
