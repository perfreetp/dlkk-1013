import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import { calculateCountdown, formatDate } from '@/utils';
import type { Anniversary } from '@/types';

interface AnniversaryCardProps {
  anniversary: Anniversary;
  onClick?: () => void;
  compact?: boolean;
}

export default function AnniversaryCard({ anniversary, onClick, compact = false }: AnniversaryCardProps) {
  const { days } = calculateCountdown(anniversary.date, anniversary.repeat);

  return (
    <View
      className={compact ? styles.compactCard : styles.card}
      onClick={onClick}
    >
      <View className={styles.header}>
        <Text className={styles.emoji}>{anniversary.emoji || '💝'}</Text>
        <View className={styles.info}>
          <Text className={styles.title}>{anniversary.title}</Text>
          <Text className={styles.date}>
            {formatDate(anniversary.date)}
            {anniversary.repeat !== 'none' && (
              <Text className={styles.repeat}>
                （{anniversary.repeat === 'yearly' ? '每年' : '每月'}重复）
              </Text>
            )}
          </Text>
        </View>
        <View className={styles.daysWrap}>
          <Text className={styles.days}>{anniversary.type === 'memorial' ? days : days}</Text>
          <Text className={styles.unit}>{anniversary.type === 'memorial' ? '天' : '天'}</Text>
        </View>
      </View>
      {!compact && anniversary.blessing && (
        <View className={styles.blessing}>
          <Text className={styles.blessingText}>「{anniversary.blessing}」</Text>
        </View>
      )}
    </View>
  );
}
