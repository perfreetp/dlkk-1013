import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { formatDate } from '@/utils';
import type { Wish } from '@/types';

interface WishCardProps {
  wish: Wish;
  onClaim?: () => void;
  onComplete?: () => void;
  onClick?: () => void;
}

const statusConfig = {
  pending: { label: '待认领', color: '#FF9800', bg: 'rgba(255, 152, 0, 0.1)' },
  claimed: { label: '进行中', color: '#2196F3', bg: 'rgba(33, 150, 243, 0.1)' },
  completed: { label: '已完成', color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)' }
};

const priorityConfig = {
  low: { label: '💚', text: '慢慢来' },
  medium: { label: '💛', text: '有空做' },
  high: { label: '❤️', text: '很想实现' }
};

export default function WishCard({ wish, onClaim, onComplete, onClick }: WishCardProps) {
  const status = statusConfig[wish.status];
  const priority = priorityConfig[wish.priority];

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.titleWrap}>
          <Text className={styles.emoji}>{priority.label}</Text>
          <Text className={styles.title}>{wish.title}</Text>
        </View>
        <View
          className={styles.statusTag}
          style={{ color: status.color, backgroundColor: status.bg }}
        >
          <Text>{status.label}</Text>
        </View>
      </View>

      <Text className={styles.description}>{wish.description}</Text>

      <View className={styles.meta}>
        <View className={styles.priority}>
          <Text className={styles.priorityText}>{priority.text}</Text>
        </View>
        {wish.deadline && (
          <Text className={styles.deadline}>截止：{formatDate(wish.deadline)}</Text>
        )}
      </View>

      {wish.claimedByName && (
        <View className={styles.claimer}>
          <Text>🤝 由 {wish.claimedByName} 认领</Text>
        </View>
      )}

      {wish.status !== 'completed' && (
        <View className={styles.actions}>
          {wish.status === 'pending' && (
            <View
              className={classnames(styles.actionBtn, styles.primaryBtn)}
              onClick={(e) => {
                e.stopPropagation();
                onClaim?.();
              }}
            >
              <Text className={styles.btnText}>我来认领</Text>
            </View>
          )}
          {wish.status === 'claimed' && (
            <View
              className={classnames(styles.actionBtn, styles.successBtn)}
              onClick={(e) => {
                e.stopPropagation();
                onComplete?.();
              }}
            >
              <Text className={styles.btnText}>✅ 标记完成</Text>
            </View>
          )}
        </View>
      )}

      {wish.status === 'completed' && wish.completedAt && (
        <View className={styles.completedAt}>
          <Text>🎉 于 {formatDate(wish.completedAt)} 完成</Text>
        </View>
      )}
    </View>
  );
}
