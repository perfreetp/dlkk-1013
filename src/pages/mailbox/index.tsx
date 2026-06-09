import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
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
  const markLetterRead = useAppStore((state) => state.markLetterRead);

  useDidShow(() => {
    console.log('[MailboxPage] Page did show');
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

  const tabs: { key: FilterType; label: string; showBadge?: boolean }[] = [
    { key: 'inbox', label: '📥 收件箱', showBadge: true },
    { key: 'sent', label: '📤 已发送' },
    { key: 'scheduled', label: '🕐 定时信' }
  ];

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.tabs}>
        {tabs.map((tab) => (
          <Text
            key={tab.key}
            className={classnames(styles.tabItem, filterType === tab.key && styles.active)}
            onClick={() => setFilterType(tab.key)}
          >
            {tab.label}
            {tab.showBadge && unreadCount > 0 && filterType !== tab.key && (
              <View className={styles.unreadBadge}>{unreadCount}</View>
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
            <View className={styles.letterContent}>{selectedLetter.content}</View>
            <View className={styles.letterFooter}>
              <Text className={styles.letterDate}>{formatDateTime(selectedLetter.createdAt)}</Text>
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
