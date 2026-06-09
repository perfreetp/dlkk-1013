import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import DiaryCard from '@/components/DiaryCard';
import EmptyState from '@/components/EmptyState';
import type { Diary } from '@/types';

function DiaryPage() {
  const diaries = useAppStore((state) => state.diaries);
  const currentUser = useAppStore((state) => state.currentUser);

  useDidShow(() => {
    console.log('[DiaryPage] Page did show');
  });

  const [activeTag, setActiveTag] = useState<string>('全部');
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockInput, setLockInput] = useState('');
  const [pendingDiary, setPendingDiary] = useState<Diary | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tags.add('全部');
    tags.add('我的');
    tags.add('私密 🔒');
    diaries.forEach((d) => d.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [diaries]);

  const filteredDiaries = useMemo(() => {
    return diaries.filter((diary) => {
      if (activeTag === '全部') return true;
      if (activeTag === '我的') return diary.authorId === currentUser.id;
      if (activeTag === '私密 🔒') return diary.isPrivate;
      return diary.tags.includes(activeTag);
    });
  }, [diaries, activeTag, currentUser.id]);

  const stats = useMemo(() => ({
    total: diaries.length,
    mine: diaries.filter((d) => d.authorId === currentUser.id).length,
    private: diaries.filter((d) => d.isPrivate).length
  }), [diaries, currentUser.id]);

  const handleDiaryClick = (diary: Diary) => {
    if (diary.isPrivate) {
      setPendingDiary(diary);
      setShowLockModal(true);
    } else {
      Taro.navigateTo({
        url: `/pages/diary-detail/index?id=${diary.id}`
      });
    }
  };

  const handleUnlock = () => {
    if (lockInput === '1234' || lockInput === '') {
      setShowLockModal(false);
      setLockInput('');
      if (pendingDiary) {
        Taro.navigateTo({
          url: `/pages/diary-detail/index?id=${pendingDiary.id}`
        });
      }
      setPendingDiary(null);
    } else {
      Taro.showToast({ title: '密码错误', icon: 'error' });
    }
  };

  const handleWrite = () => {
    Taro.navigateTo({ url: '/pages/diary-edit/index' });
  };

  return (
    <ScrollView scrollY className={styles.container} refresherEnabled>
      <View className={styles.statsBar}>
        <View className={styles.statsItem}>
          <Text className={styles.statsNumber}>{stats.total}</Text>
          <Text className={styles.statsLabel}>总日记数</Text>
        </View>
        <View className={styles.statsItem}>
          <Text className={styles.statsNumber}>{stats.mine}</Text>
          <Text className={styles.statsLabel}>我写的</Text>
        </View>
        <View className={styles.statsItem}>
          <Text className={styles.statsNumber}>{stats.private}</Text>
          <Text className={styles.statsLabel}>私密日记</Text>
        </View>
      </View>

      <ScrollView scrollX className={styles.filterBar}>
        {allTags.map((tag) => (
          <Text
            key={tag}
            className={classnames(styles.filterItem, activeTag === tag && styles.active)}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </Text>
        ))}
      </ScrollView>

      {filteredDiaries.length > 0 ? (
        filteredDiaries.map((diary) => (
          <DiaryCard
            key={diary.id}
            diary={diary}
            onClick={() => handleDiaryClick(diary)}
          />
        ))
      ) : (
        <View className={styles.emptyWrap}>
          <EmptyState
            emoji="📝"
            title="还没有日记哦"
            description="点击右下角按钮，记录你们的第一篇日记吧~"
          />
        </View>
      )}

      <View className={styles.writeBtn} onClick={handleWrite}>
        <Text className={styles.writeBtnIcon}>✏️</Text>
      </View>

      {showLockModal && (
        <View className={styles.lockModal} onClick={() => setShowLockModal(false)}>
          <View className={styles.lockContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.lockIcon}>🔒</View>
            <Text className={styles.lockTitle}>这是一篇私密日记</Text>
            <Text style={{ textAlign: 'center', fontSize: '24rpx', color: '#86909C', marginBottom: '24rpx' }}>
              请输入访问密码（默认：1234）
            </Text>
            <Input
              type="password"
              password
              value={lockInput}
              placeholder="请输入密码"
              className={styles.lockInput}
              onInput={(e) => setLockInput(e.detail.value)}
              maxlength={6}
            />
            <View className={styles.lockActions}>
              <Button
                className={classnames(styles.lockBtn, styles.cancel)}
                onClick={() => setShowLockModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.lockBtn, styles.confirm)}
                onClick={handleUnlock}
              >
                解锁
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

export default DiaryPage;
