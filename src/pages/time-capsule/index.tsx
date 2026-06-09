import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import EmptyState from '@/components/EmptyState';
import { MOOD_OPTIONS } from '@/types';

interface DayCapsule {
  date: string;
  diaries: { id: string; title: string; excerpt: string; isPrivate: boolean; authorName: string; authorAvatar?: string }[];
  photos: { id: string; url: string; description?: string }[];
  anniversaries: { id: string; title: string; emoji?: string }[];
  moods: { userId: string; userName: string; userAvatar?: string; mood: string; note?: string }[];
  summary: string;
}

interface MonthGroup {
  monthKey: string;
  monthLabel: string;
  daysCount: number;
  itemsCount: number;
  capsules: DayCapsule[];
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

function buildMonthLabel(key: string) {
  const [y, m] = key.split('-');
  return `${y}年${Number(m)}月`;
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
  const memoryPersonFilter = useAppStore((s) => s.memoryPersonFilter);
  const setMemoryPersonFilter = useAppStore((s) => s.setMemoryPersonFilter);

  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [recallDate, setRecallDate] = useState<string | null>(null);

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
      if (memoryPersonFilter && memoryPersonFilter !== 'all' && d.authorId !== memoryPersonFilter) return;
      const date = extractDate(d.createdAt);
      const cap = ensure(date);
      if (!cap.date) return;
      const isUnlocked = unlockedPrivateDiaryIds.includes(d.id);
      const author = userMap[d.authorId];
      cap.diaries.push({
        id: d.id,
        title: d.isPrivate && !isUnlocked ? '🔒 私密日记' : d.title,
        excerpt: d.isPrivate && !isUnlocked ? '解锁后查看' : d.content.replace(/\s+/g, ' ').slice(0, 40),
        isPrivate: d.isPrivate,
        authorName: d.authorName,
        authorAvatar: author?.avatar
      });
    });

    photos.forEach((p) => {
      if (memoryPersonFilter && memoryPersonFilter !== 'all' && p.uploadedBy !== memoryPersonFilter) return;
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
      if (memoryPersonFilter && memoryPersonFilter !== 'all' && m.userId !== memoryPersonFilter) return;
      const cap = ensure(m.date);
      if (!cap.date) return;
      const user = userMap[m.userId];
      cap.moods.push({
        userId: m.userId,
        userName: user?.name || 'TA',
        userAvatar: user?.avatar,
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
  }, [diaries, photos, anniversaries, moodRecords, userMap, unlockedPrivateDiaryIds, memoryPersonFilter]);

  const monthGroups = useMemo<MonthGroup[]>(() => {
    const g = new Map<string, DayCapsule[]>();
    capsules.forEach((c) => {
      const k = c.date.slice(0, 7);
      if (!g.has(k)) g.set(k, []);
      g.get(k)!.push(c);
    });
    return Array.from(g.entries())
      .map(([monthKey, caps]) => {
        const itemsCount = caps.reduce(
          (s, c) => s + c.diaries.length + c.photos.length + c.anniversaries.length + c.moods.length,
          0
        );
        return {
          monthKey,
          monthLabel: buildMonthLabel(monthKey),
          daysCount: caps.length,
          itemsCount,
          capsules: caps
        };
      })
      .sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1));
  }, [capsules]);

  const targetDate = (router?.params?.date as string) || '';

  const handleToggleMonth = (key: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleOpenDiary = (d: DayCapsule['diaries'][0]) => {
    Taro.navigateTo({ url: `/pages/diary-detail/index?id=${d.id}` });
  };

  const handleOpenPhotos = () => {
    Taro.switchTab({ url: '/pages/album/index' });
  };

  const handleOpenRecall = (date: string) => {
    setRecallDate(date);
  };

  const handleCloseRecall = () => setRecallDate(null);

  const handleSaveRecall = () => {
    Taro.showModal({
      title: '💖 回忆卡已生成',
      content: '长按卡片可以保存到相册，或截图分享给 TA~',
      showCancel: false,
      confirmText: '我知道啦',
      confirmColor: '#FF6B9D'
    });
  };

  const activeRecall = useMemo(
    () => (recallDate ? capsules.find((c) => c.date === recallDate) : undefined),
    [recallDate, capsules]
  );

  return (
    <ScrollView scrollY className={styles.container} scrollIntoView={targetDate ? `cap-${targetDate}` : ''}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>时间胶囊</Text>
        <Text className={styles.headerSub}>
          把每一天的回忆串起来 · 共 {capsules.length} 天 / {monthGroups.length} 个月
        </Text>
      </View>

      <View className={styles.personTabs}>
        {[
          { key: 'all', label: '两人回忆', icon: '💞' },
          { key: couple.user1.id, label: couple.user1.name, avatar: couple.user1.avatar, icon: '' },
          { key: couple.user2.id, label: couple.user2.name, avatar: couple.user2.avatar, icon: '' }
        ].map((p) => {
          const active = memoryPersonFilter === p.key || (!memoryPersonFilter && p.key === 'all');
          return (
            <View
              key={p.key}
              className={classnames(styles.personTab, active && styles.personTabActive)}
              onClick={() => setMemoryPersonFilter(p.key)}
            >
              {p.avatar ? (
                <Image src={p.avatar} className={styles.personTabAvatar} mode="aspectFill" />
              ) : (
                <Text className={styles.personTabIcon}>{p.icon}</Text>
              )}
              <Text className={classnames(styles.personTabLabel, active && styles.personTabLabelActive)}>
                {p.label}
              </Text>
            </View>
          );
        })}
      </View>

      {capsules.length === 0 ? (
        <EmptyState
          emoji="📅"
          title="还没有回忆哦"
          description="写日记、上传照片、记录心情，它们会按日期出现在这里~"
        />
      ) : (
        <View className={styles.timeline}>
          {monthGroups.map((month) => {
            const collapsed = collapsedMonths.has(month.monthKey);
            return (
              <View key={month.monthKey}>
                <View className={styles.monthHeader} onClick={() => handleToggleMonth(month.monthKey)}>
                  <View className={styles.monthDot} />
                  <View style={{ flex: 1 }}>
                    <Text className={styles.monthLabel}>{month.monthLabel}</Text>
                    <Text className={styles.monthMeta}>
                      {month.daysCount} 天 · {month.itemsCount} 条回忆
                    </Text>
                  </View>
                  <Text className={classnames(styles.monthToggle, collapsed && styles.monthToggleCollapsed)}>
                    ▼
                  </Text>
                </View>

                {!collapsed &&
                  month.capsules.map((cap) => (
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
                          <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                            <View className={styles.recallBtn} onClick={() => handleOpenRecall(cap.date)}>
                              <Text style={{ fontSize: '22rpx' }}>💌</Text>
                              <Text style={{ fontSize: '22rpx', color: '#FF6B9D', fontWeight: 600 }}>回忆卡</Text>
                            </View>
                            <View className={styles.summaryBox}>
                              <Text className={styles.summaryText}>{cap.summary}</Text>
                            </View>
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
                                    <View className={styles.moodAvatarLine}>
                                      {m.userAvatar && (
                                        <Image src={m.userAvatar} className={styles.moodAvatar} mode="aspectFill" />
                                      )}
                                      <View
                                        className={styles.moodBubble}
                                        style={{ borderColor: `${info.color}55`, backgroundColor: `${info.color}15` }}
                                      >
                                        <Text className={styles.moodEmoji}>{info.emoji}</Text>
                                        <Text className={styles.moodLabel} style={{ color: info.color }}>
                                          {info.label}
                                        </Text>
                                      </View>
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
                                  <Image
                                    src={d.authorAvatar}
                                    className={styles.diaryAuthorAvatar}
                                    mode="aspectFill"
                                  />
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
                              <Text className={styles.moreLink} onClick={handleOpenPhotos}>
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
                                <View className={styles.photoMore} onClick={handleOpenPhotos}>
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
            );
          })}
        </View>
      )}

      {activeRecall && (
        <View className={styles.recallMask} onClick={handleCloseRecall}>
          <View className={styles.recallCardWrap} onClick={(e) => e.stopPropagation()}>
            <View className={styles.recallClose} onClick={handleCloseRecall}>
              <Text style={{ color: '#fff', fontSize: '32rpx' }}>×</Text>
            </View>
            <View className={styles.recallCard}>
              <View className={styles.recallDecor}>
                <Text className={styles.recallDecorText}>MEMORIES</Text>
              </View>
              <View className={styles.recallHeader}>
                <Text className={styles.recallDateLabel}>{formatDateLabel(activeRecall.date)}</Text>
                <Text className={styles.recallWeekday}>{getWeekDay(activeRecall.date)}</Text>
                <Text className={styles.recallSummary}>{activeRecall.summary}</Text>
              </View>

              <View className={styles.recallDivider}>
                <Text>· · · · · · · · ·</Text>
              </View>

              {activeRecall.moods.length > 0 && (
                <View className={styles.recallSection}>
                  <Text className={styles.recallSectionTitle}>💗 两个人的心情</Text>
                  <View className={styles.recallMoods}>
                    {activeRecall.moods.map((m, i) => {
                      const info = getMoodInfo(m.mood);
                      return (
                        <View key={i} className={styles.recallMoodItem}>
                          <Image src={m.userAvatar} className={styles.recallMoodAvatar} mode="aspectFill" />
                          <View
                            className={styles.recallMoodBubble}
                            style={{ background: `${info.color}15`, borderColor: `${info.color}55` }}
                          >
                            <Text>{info.emoji} {info.label}</Text>
                            <Text className={styles.recallMoodName}>{m.userName}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {activeRecall.anniversaries.length > 0 && (
                <View className={styles.recallSection}>
                  <Text className={styles.recallSectionTitle}>🎀 特别的日子</Text>
                  {activeRecall.anniversaries.map((a) => (
                    <Text key={a.id} className={styles.recallAnniv}>
                      {a.emoji || '🎂'} {a.title}
                    </Text>
                  ))}
                </View>
              )}

              {activeRecall.diaries.length > 0 && (
                <View className={styles.recallSection}>
                  <Text className={styles.recallSectionTitle}>📝 日记片段</Text>
                  {activeRecall.diaries.map((d) => (
                    <View key={d.id} className={styles.recallDiary}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '10rpx', marginBottom: '6rpx' }}>
                        <Image src={d.authorAvatar} className={styles.recallAuthorAvatar} mode="aspectFill" />
                        <Text className={styles.recallDiaryTitle}>{d.title}</Text>
                      </View>
                      <Text className={styles.recallDiaryExcerpt}>「{d.excerpt}」</Text>
                    </View>
                  ))}
                </View>
              )}

              {activeRecall.photos.length > 0 && (
                <View className={styles.recallSection}>
                  <Text className={styles.recallSectionTitle}>📷 定格瞬间</Text>
                  <View className={styles.recallPhotos}>
                    {activeRecall.photos.slice(0, 9).map((p) => (
                      <Image
                        key={p.id}
                        src={p.url}
                        className={styles.recallPhotoThumb}
                        mode="aspectFill"
                      />
                    ))}
                  </View>
                </View>
              )}

              <View className={styles.recallSign}>
                <Image src={couple.user1.avatar} className={styles.recallSignAvatar} mode="aspectFill" />
                <Image src={couple.user2.avatar} className={styles.recallSignAvatar} mode="aspectFill" />
                <Text className={styles.recallSignText}>与 {couple.user2.name} 的专属回忆</Text>
              </View>
            </View>

            <View className={styles.recallSaveBtn} onClick={handleSaveRecall}>
              <Text style={{ color: '#fff', fontSize: '28rpx', fontWeight: 600 }}>💾 保存这张回忆卡</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

export default TimeCapsulePage;

