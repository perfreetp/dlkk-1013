import React, { useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import EmptyState from '@/components/EmptyState';
import type { ActivityRecord } from '@/types';

const typeMeta: Record<
  ActivityRecord['type'],
  { icon: string; color: string; label: string }
> = {
  diary_edited: { icon: '✏️', color: '#FF9800', label: '日记编辑' },
  photo_uploaded: { icon: '📷', color: '#4CAF50', label: '照片上传' },
  photo_favorited: { icon: '⭐', color: '#FFC107', label: '收藏照片' },
  wish_claimed: { icon: '🌟', color: '#8BC34A', label: '愿望认领' },
  letter_read: { icon: '💌', color: '#FF6B9D', label: '信件阅读' }
};

function formatTime(str: string) {
  if (!str) return '';
  const now = new Date();
  const t = new Date(str.replace(/-/g, '/'));
  const diff = (now.getTime() - t.getTime()) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}天前`;
  return str.slice(0, 16);
}

function ActivityPage() {
  const activities = useAppStore((s) => s.activities);
  const currentUser = useAppStore((s) => s.currentUser);
  const couple = useAppStore((s) => s.couple);
  const markActivityRead = useAppStore((s) => s.markActivityRead);
  const markAllActivitiesRead = useAppStore((s) => s.markAllActivitiesRead);
  const getUnreadActivityCount = useAppStore((s) => s.getUnreadActivityCount);
  const memoryPersonFilter = useAppStore((s) => s.memoryPersonFilter);
  const setMemoryPersonFilter = useAppStore((s) => s.setMemoryPersonFilter);

  const unreadCount = useMemo(
    () => getUnreadActivityCount(currentUser.id),
    [activities, currentUser.id, getUnreadActivityCount]
  );

  const filteredActivities = useMemo(() => {
    if (!memoryPersonFilter || memoryPersonFilter === 'all') return activities;
    return activities.filter((a) => a.actorId === memoryPersonFilter);
  }, [activities, memoryPersonFilter]);

  const personTabs = [
    { key: 'all', label: '全部', avatar: '', icon: '💞' },
    { key: couple.user1.id, label: couple.user1.name, avatar: couple.user1.avatar, icon: '' },
    { key: couple.user2.id, label: couple.user2.name, avatar: couple.user2.avatar, icon: '' }
  ];

  useDidShow(() => {
    if (unreadCount > 0) {
      markAllActivitiesRead(currentUser.id);
    }
  });

  const handleJump = (a: ActivityRecord) => {
    if (!a.readBy.includes(currentUser.id)) {
      markActivityRead(a.id, currentUser.id);
    }
    switch (a.type) {
      case 'diary_edited':
        Taro.navigateTo({ url: `/pages/diary-detail/index?id=${a.targetId}` });
        break;
      case 'photo_uploaded':
        if (a.targetId === 'all-photos') {
          Taro.switchTab({ url: '/pages/album/index' });
        } else {
          Taro.navigateTo({
            url: `/pages/album-detail/index?groupId=${a.targetId}&name=${encodeURIComponent(a.targetTitle.replace(/^相册「|」$/g, ''))}`
          });
        }
        break;
      case 'photo_favorited':
        try {
          Taro.setStorageSync('album_default_tab', 'favorites');
        } catch (e) { /* ignore */ }
        Taro.switchTab({ url: '/pages/album/index' });
        break;
      case 'wish_claimed':
        Taro.navigateTo({ url: '/pages/wishlist/index?highlight=' + encodeURIComponent(a.targetId) });
        break;
      case 'letter_read':
        Taro.navigateTo({ url: '/pages/mailbox/index?tab=sent' });
        break;
    }
  };

  const handleMarkAll = () => {
    markAllActivitiesRead(currentUser.id);
    Taro.showToast({ title: '全部已读 ✅', icon: 'none' });
  };

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.header}>
        <View>
          <Text className={styles.headerTitle}>动态中心</Text>
          <Text className={styles.headerSub}>
            记录两个人的每一次互动 · 共 {activities.length} 条
          </Text>
        </View>
        {unreadCount > 0 && (
          <View className={styles.markAllBtn} onClick={handleMarkAll}>
            <Text className={styles.markAllText}>全部已读</Text>
          </View>
        )}
      </View>

      <View className={styles.personTabs}>
        {personTabs.map((p) => {
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
              <Text
                className={classnames(styles.personTabLabel, active && styles.personTabLabelActive)}
              >
                {p.label}
              </Text>
            </View>
          );
        })}
      </View>

      {filteredActivities.length === 0 ? (
        <EmptyState
          emoji="💫"
          title="还没有动态哦"
          description="和 TA 一起编辑日记、上传照片、认领愿望，就会出现在这里啦~"
        />
      ) : (
        <View className={styles.list}>
          {filteredActivities.map((a) => {
            const meta = typeMeta[a.type];
            const isUnread =
              !a.readBy.includes(currentUser.id) && a.actorId !== currentUser.id;
            return (
              <View
                key={a.id}
                className={classnames(styles.activityItem, isUnread && styles.unread)}
                onClick={() => handleJump(a)}
              >
                {isUnread && <View className={styles.redDot} />}
                <View className={styles.iconBox} style={{ backgroundColor: `${meta.color}22` }}>
                  <Text className={styles.activityIcon}>{meta.icon}</Text>
                </View>
                <View className={styles.info}>
                  <View className={styles.topRow}>
                    <Text className={styles.typeLabel} style={{ color: meta.color }}>
                      {meta.label}
                    </Text>
                    <Text className={styles.timeText}>{formatTime(a.createdAt)}</Text>
                  </View>
                  <View className={styles.actorRow}>
                    <Image
                      className={styles.avatar}
                      src={a.actorAvatar}
                      mode="aspectFill"
                    />
                    <Text className={styles.actorName}>{a.actorName}</Text>
                    <Text className={styles.actionText}>{a.detail || '更新了内容'}</Text>
                  </View>
                  <View className={styles.targetBox}>
                    <Text className={styles.targetTitle} numberOfLines={1}>
                      {a.targetTitle}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

export default ActivityPage;
