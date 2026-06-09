import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import LetterCard from '@/components/LetterCard';
import EmptyState from '@/components/EmptyState';
import { formatDateTime } from '@/utils';
import type { Letter } from '@/types';

type FilterType = 'inbox' | 'sent' | 'scheduled';

function MailboxPage() {
  const letters = useAppStore((state) => state.letters);
  const currentUser = useAppStore((state) => state.currentUser);
  const couple = useAppStore((state) => state.couple);
  const markLetterRead = useAppStore((state) => state.markLetterRead);
  const processAllScheduledLetters = useAppStore((state) => state.processAllScheduledLetters);
  const switchUser = useAppStore((state) => state.switchUser);

  useDidShow(() => {
    console.log('[MailboxPage] Page did show');
    processAllScheduledLetters();
  });

  const [filterType, setFilterType] = useState<FilterType>('inbox');
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  const inboxLetters = useMemo(
    () => letters.filter((l) => l.toUserId === currentUser.id && l.isSent),
    [letters, currentUser.id]
  );
  const sentLetters = useMemo(
    () => letters.filter((l) => l.fromUserId === currentUser.id && l.isSent),
    [letters, currentUser.id]
  );
  const scheduledLetters = useMemo(
    () => letters.filter((l) => l.fromUserId === currentUser.id && !l.isSent),
    [letters, currentUser.id]
  );

  const unreadCount = useMemo(
    () => inboxLetters.filter((l) => !l.isRead).length,
    [inboxLetters]
  );

  const user1Unread = useMemo(
    () =>
      letters.filter(
        (l) => l.toUserId === couple.user1.id && l.isSent && !l.isRead
      ).length,
    [letters, couple.user1.id]
  );
  const user2Unread = useMemo(
    () =>
      letters.filter(
        (l) => l.toUserId === couple.user2.id && l.isSent && !l.isRead
      ).length,
    [letters, couple.user2.id]
  );

  const displayedLetters = useMemo(() => {
    switch (filterType) {
      case 'inbox':
        return inboxLetters;
      case 'sent':
        return sentLetters;
      case 'scheduled':
        return scheduledLetters;
      default:
        return [];
    }
  }, [inboxLetters, sentLetters, scheduledLetters, filterType]);

  const handleLetterClick = (letter: Letter) => {
    if (!letter.isRead && letter.toUserId === currentUser.id) {
      markLetterRead(letter.id);
    }
    setSelectedLetter(letter);
  };

  const handleWrite = () => {
    Taro.navigateTo({ url: '/pages/letter-write/index' });
  };

  const users = [couple.user1, couple.user2];

  const tabs: { key: FilterType; label: string; showBadge?: boolean }[] = [
    { key: 'inbox', label: '📥 收件箱', showBadge: true },
    { key: 'sent', label: '📤 已发送' },
    { key: 'scheduled', label: '🕐 定时信' }
  ];

  return (
    <ScrollView scrollY className={styles.container}>
      <View
        style={{
          display: 'flex',
          gap: '16rpx',
          padding: '20rpx 24rpx 0',
          marginBottom: '8rpx'
        }}
      >
        {users.map((u) => {
          const isActive = currentUser.id === u.id;
          const badge = u.id === couple.user1.id ? user1Unread : user2Unread;
          return (
            <View
              key={u.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '16rpx',
                padding: '16rpx 20rpx',
                borderRadius: '20rpx',
                background: isActive
                  ? 'linear-gradient(135deg, #FF6B9D 0%, #FF85B1 100%)'
                  : '#F7F8FA',
                boxShadow: isActive ? '0 4px 16px rgba(255,107,157,0.3)' : 'none',
                position: 'relative'
              }}
              onClick={() => switchUser(u.id)}
            >
              <Image
                src={u.avatar}
                style={{
                  width: '64rpx',
                  height: '64rpx',
                  borderRadius: '32rpx',
                  border: isActive ? '4rpx solid #fff' : 'none'
                }}
                mode="aspectFill"
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    display: 'block',
                    fontSize: '28rpx',
                    fontWeight: 'bold',
                    color: isActive ? '#fff' : '#1D2129'
                  }}
                >
                  {u.name}的信箱
                </Text>
                <Text
                  style={{
                    display: 'block',
                    fontSize: '22rpx',
                    color: isActive ? 'rgba(255,255,255,0.85)' : '#86909C'
                  }}
                >
                  {badge > 0 ? `${badge} 封未读` : '暂无新信件'}
                </Text>
              </View>
              {badge > 0 && (
                <View
                  style={{
                    minWidth: '36rpx',
                    height: '36rpx',
                    padding: '0 10rpx',
                    borderRadius: '18rpx',
                    background: isActive ? '#fff' : '#F53F3F',
                    color: isActive ? '#FF6B9D' : '#fff',
                    fontSize: '22rpx',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    lineHeight: '36rpx',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? '#FF6B9D' : '#fff',
                      fontSize: '22rpx',
                      fontWeight: 'bold',
                      lineHeight: '36rpx'
                    }}
                  >
                    {badge > 99 ? '99+' : badge}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
      <View className={styles.tabs}>
        {tabs.map((tab) => (
          <Text
            key={tab.key}
            className={classnames(styles.tabItem, filterType === tab.key && styles.active)}
            onClick={() => setFilterType(tab.key)}
          >
            {tab.label}
            {tab.showBadge && unreadCount > 0 && filterType !== tab.key && (
              <View className={styles.unreadBadge}>
                <Text style={{ color: '#fff', fontSize: '20rpx', lineHeight: '32rpx' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </Text>
        ))}
      </View>

      {displayedLetters.length > 0 ? (
        displayedLetters.map((letter) => (
          <LetterCard
            key={letter.id}
            letter={letter}
            onClick={() => handleLetterClick(letter)}
          />
        ))
      ) : (
        <View className={styles.mailboxEmpty}>
          <View className={styles.emptyIcon}>💌</View>
          <Text className={styles.emptyTitle}>
            {filterType === 'inbox'
              ? '收件箱是空的'
              : filterType === 'sent'
              ? '还没有发送过信件'
              : '没有定时信件'}
          </Text>
          <Text className={styles.emptyDesc}>
            {filterType === 'inbox'
              ? '期待他/她的第一封悄悄话吧~'
              : '点击右下角按钮，写下你想说的话'}
          </Text>
        </View>
      )}

      <View className={styles.writeBtn} onClick={handleWrite}>
        <Text className={styles.writeBtnIcon}>✉️</Text>
      </View>

      {selectedLetter && (
        <View className={styles.letterDetailModal} onClick={() => setSelectedLetter(null)}>
          <View className={styles.letterCard} onClick={(e) => e.stopPropagation()}>
            <View className={styles.letterStamp}>💮</View>
            <Text className={styles.letterFrom}>来自 {selectedLetter.fromUserName}</Text>
            <Text className={styles.letterTitle}>{selectedLetter.title}</Text>
            {!selectedLetter.isSent && selectedLetter.scheduledSendTime && (
              <View
                style={{
                  background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EE 100%)',
                  borderRadius: '16rpx',
                  padding: '20rpx 24rpx',
                  marginBottom: '24rpx',
                  border: '2rpx dashed #FF85B1'
                }}
              >
                <Text
                  style={{
                    display: 'block',
                    fontSize: '24rpx',
                    color: '#FF6B9D',
                    fontWeight: 'bold',
                    marginBottom: '8rpx'
                  }}
                >
                  🕐 定时信件
                </Text>
                <Text style={{ fontSize: '26rpx', color: '#F53F3F' }}>
                  预计发送时间：{formatDateTime(selectedLetter.scheduledSendTime)}
                </Text>
              </View>
            )}
            <View className={styles.letterContent}>{selectedLetter.content}</View>
            <View className={styles.letterFooter}>
              <Text className={styles.letterDate}>
                {!selectedLetter.isSent
                  ? `撰写于 ${formatDateTime(selectedLetter.createdAt)}`
                  : formatDateTime(selectedLetter.createdAt)}
              </Text>
              <Text className={styles.letterSign}>—— {selectedLetter.fromUserName}</Text>
            </View>
            <Button className={styles.closeBtn} onClick={() => setSelectedLetter(null)}>
              关闭
            </Button>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

export default MailboxPage;
