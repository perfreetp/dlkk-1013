import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import WishCard from '@/components/WishCard';
import EmptyState from '@/components/EmptyState';
import type { Wish } from '@/types';

type FilterType = 'all' | 'pending' | 'claimed' | 'completed';

function WishlistPage() {
  const wishes = useAppStore((state) => state.wishes);
  const currentUser = useAppStore((state) => state.currentUser);
  const claimWish = useAppStore((state) => state.claimWish);
  const completeWish = useAppStore((state) => state.completeWish);

  useDidShow(() => {
    console.log('[WishlistPage] Page did show');
  });

  const [filterType, setFilterType] = useState<FilterType>('all');

  const stats = useMemo(() => ({
    pending: wishes.filter((w) => w.status === 'pending').length,
    claimed: wishes.filter((w) => w.status === 'claimed').length,
    completed: wishes.filter((w) => w.status === 'completed').length
  }), [wishes]);

  const completionRate = useMemo(() => {
    if (wishes.length === 0) return 0;
    return Math.round((stats.completed / wishes.length) * 100);
  }, [wishes.length, stats.completed]);

  const filteredWishes = useMemo(() => {
    if (filterType === 'all') return wishes;
    return wishes.filter((w) => w.status === filterType);
  }, [wishes, filterType]);

  const handleClaim = (wish: Wish) => {
    claimWish(wish.id, currentUser.id, currentUser.name);
    Taro.showToast({ title: '已认领，加油实现吧！💪', icon: 'none' });
  };

  const handleComplete = (wish: Wish) => {
    Taro.showModal({
      title: '确认完成？',
      content: `确定「${wish.title}」已经实现了吗？`,
      confirmText: '已实现',
      confirmColor: '#4CAF50',
      success: (res) => {
        if (res.confirm) {
          completeWish(wish.id);
          Taro.showToast({ title: '太棒了！🎉', icon: 'none' });
        }
      }
    });
  };

  const handleAdd = () => {
    Taro.navigateTo({ url: '/pages/wish-edit/index' });
  };

  const tabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '🎯 待认领' },
    { key: 'claimed', label: '💪 进行中' },
    { key: 'completed', label: '🎉 已完成' }
  ];

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.completionRate}>
        <Text className={styles.completionTitle}>🎯 愿望完成进度</Text>
        <View className={styles.completionBar}>
          <View
            className={styles.completionProgress}
            style={{ width: `${completionRate}%` }}
          />
        </View>
        <Text className={styles.completionText}>
          已完成 {stats.completed} / {wishes.length} 个愿望 · {completionRate}%
        </Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.pending)}>{stats.pending}</Text>
          <Text className={styles.statLabel}>待认领</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.claimed)}>{stats.claimed}</Text>
          <Text className={styles.statLabel}>进行中</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.completed)}>{stats.completed}</Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        {tabs.map((tab) => (
          <Text
            key={tab.key}
            className={classnames(styles.tabItem, filterType === tab.key && styles.active)}
            onClick={() => setFilterType(tab.key)}
          >
            {tab.label}
          </Text>
        ))}
      </View>

      {filteredWishes.length > 0 ? (
        filteredWishes.map((wish) => (
          <WishCard
            key={wish.id}
            wish={wish}
            onClaim={() => handleClaim(wish)}
            onComplete={() => handleComplete(wish)}
          />
        ))
      ) : (
        <EmptyState emoji="🌟" title="还没有愿望哦" description="点击右下角按钮添加愿望吧~" />
      )}

      <View className={styles.addBtn} onClick={handleAdd}>
        <Text className={styles.addBtnIcon}>+</Text>
      </View>
    </ScrollView>
  );
}

export default WishlistPage;
