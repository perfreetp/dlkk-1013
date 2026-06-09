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
  const addMoodRecord = useAppStore((state) => state.addMoodRecord);
  const processAllScheduledLetters = useAppStore((state) => state.processAllScheduledLetters);

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
