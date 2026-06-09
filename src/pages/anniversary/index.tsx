import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { calculateCountdown, calculateDaysTogether, generateBlessing } from '@/utils';
import AnniversaryCard from '@/components/AnniversaryCard';
import EmptyState from '@/components/EmptyState';

type FilterType = 'all' | 'memorial' | 'countdown';

function AnniversaryPage() {
  const anniversaries = useAppStore((state) => state.anniversaries);
  const couple = useAppStore((state) => state.couple);

  useDidShow(() => {
    console.log('[AnniversaryPage] Page did show');
  });

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [blessing, setBlessing] = useState(
    generateBlessing('anniversary', [couple.user1.name, couple.user2.name])
  );

  const daysTogether = calculateDaysTogether(couple.anniversary);

  const nextAnniversary = useMemo(() => {
    if (anniversaries.length === 0) return null;
    return anniversaries.reduce((prev, curr) => {
      const prevDays = calculateCountdown(prev.date, prev.repeat).days;
      const currDays = calculateCountdown(curr.date, curr.repeat).days;
      return currDays < prevDays ? curr : prev;
    });
  }, [anniversaries]);

  const nextAnniversaryDays = nextAnniversary
    ? calculateCountdown(nextAnniversary.date, nextAnniversary.repeat).days
    : 0;

  const filteredAnniversaries = useMemo(() => {
    if (filterType === 'all') return anniversaries;
    return anniversaries.filter((a) => a.type === filterType);
  }, [anniversaries, filterType]);

  const handleRefreshBlessing = () => {
    const types = ['anniversary', 'birthday', 'countdown'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    setBlessing(generateBlessing(randomType, [couple.user1.name, couple.user2.name]));
    Taro.showToast({ title: '新祝福语已生成 ✨', icon: 'none' });
  };

  const handleAdd = () => {
    Taro.navigateTo({ url: '/pages/anniversary-edit/index' });
  };

  return (
    <ScrollView scrollY className={styles.container} refresherEnabled>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>💝 在一起 {daysTogether} 天</Text>
        <Text className={styles.headerSubtitle}>每一个有你的日子都值得纪念</Text>
        {nextAnniversary && (
          <View className={styles.nextBigDay}>
            <Text className={styles.nextBigDayLabel}>🎯 下一个重要日子</Text>
            <View className={styles.nextBigDayContent}>
              <View>
                <Text className={styles.nextBigDayTitle}>
                  {nextAnniversary.emoji} {nextAnniversary.title}
                </Text>
                <Text className={styles.nextBigDayDate}>
                  {calculateCountdown(nextAnniversary.date, nextAnniversary.repeat).date}
                </Text>
              </View>
              <View className={styles.nextBigDayDays}>
                <Text className={styles.nextBigDayNumber}>{nextAnniversaryDays}</Text>
                <Text className={styles.nextBigDayUnit}>天后</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View className={styles.blessingCard}>
        <Text className={styles.blessingIcon}>💫</Text>
        <Text className={styles.blessingLabel}>💝 今日祝福语</Text>
        <Text className={styles.blessingText}>「{blessing}」</Text>
        <View className={styles.blessingRefresh} onClick={handleRefreshBlessing}>
          <Text>🔄 换一句</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        <Text
          className={classnames(styles.tabItem, filterType === 'all' && styles.active)}
          onClick={() => setFilterType('all')}
        >
          全部
        </Text>
        <Text
          className={classnames(styles.tabItem, filterType === 'memorial' && styles.active)}
          onClick={() => setFilterType('memorial')}
        >
          💕 纪念日
        </Text>
        <Text
          className={classnames(styles.tabItem, filterType === 'countdown' && styles.active)}
          onClick={() => setFilterType('countdown')}
        >
          ⏰ 倒计时
        </Text>
      </View>

      {filteredAnniversaries.length > 0 ? (
        filteredAnniversaries.map((anniv) => <AnniversaryCard key={anniv.id} anniversary={anniv} />)
      ) : (
        <EmptyState emoji="📅" title="还没有纪念日" description="点击右下角按钮添加吧~" />
      )}

      <View className={styles.addBtn} onClick={handleAdd}>
        <Text className={styles.addBtnIcon}>+</Text>
      </View>
    </ScrollView>
  );
}

export default AnniversaryPage;
