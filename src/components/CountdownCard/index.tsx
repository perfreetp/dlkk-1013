import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import { calculateCountdown, formatDate } from '@/utils';

interface CountdownCardProps {
  title: string;
  date: string;
  repeat?: 'none' | 'yearly' | 'monthly';
  emoji?: string;
  type?: 'countdown' | 'memorial';
  blessing?: string;
  onClick?: () => void;
}

export default function CountdownCard({
  title,
  date,
  repeat = 'none',
  emoji = '💝',
  type = 'countdown',
  blessing,
  onClick
}: CountdownCardProps) {
  const { days } = calculateCountdown(date, repeat);
  const anniversary = type === 'memorial';
  const displayDays = anniversary
    ? Math.abs(days) || 0
    : days;

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <Text className={styles.emoji}>{emoji}</Text>
        <View className={styles.titleWrap}>
          <Text className={styles.title}>{title}</Text>
          <Text className={styles.date}>{formatDate(date)}</Text>
        </View>
      </View>
      <View className={styles.daysWrap}>
        <Text className={styles.days}>{displayDays}</Text>
        <Text className={styles.unit}>{anniversary ? '天' : '天后'}</Text>
      </View>
      {blessing && (
        <View className={styles.blessing}>
          <Text className={styles.blessingText}>「{blessing}」</Text>
        </View>
      )}
    </View>
  );
}
