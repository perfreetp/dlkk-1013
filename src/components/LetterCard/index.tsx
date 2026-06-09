import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { formatRelativeTime } from '@/utils';
import type { Letter } from '@/types';

interface LetterCardProps {
  letter: Letter;
  onClick?: () => void;
}

export default function LetterCard({ letter, onClick }: LetterCardProps) {
  const isUnread = !letter.isRead;
  const isScheduled = !letter.isSent;

  return (
    <View
      className={classnames(styles.card, isUnread && styles.unread, isScheduled && styles.scheduled)}
      onClick={onClick}
    >
      <View className={styles.header}>
        <View className={styles.iconWrap}>
          <Text className={styles.icon}>
            {isScheduled ? '🕐' : isUnread ? '💌' : '📩'}
          </Text>
        </View>
        <View className={styles.info}>
          <View className={styles.titleRow}>
            <Text className={styles.title}>{letter.title}</Text>
            {isUnread && <View className={styles.unreadDot} />}
          </View>
          <Text className={styles.from}>来自 {letter.fromUserName}</Text>
        </View>
        <View className={styles.timeWrap}>
          <Text className={styles.time}>
            {isScheduled ? '定时发送' : formatRelativeTime(letter.createdAt)}
          </Text>
        </View>
      </View>
      <Text className={styles.preview}>{letter.content}</Text>
      {isScheduled && letter.scheduledSendTime && (
        <View className={styles.scheduleTip}>
          <Text>🕐 将于 {letter.scheduledSendTime.slice(0, 16)} 发送</Text>
        </View>
      )}
    </View>
  );
}
