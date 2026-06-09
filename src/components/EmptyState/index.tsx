import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  title: string;
  description?: string;
  emoji?: string;
}

export default function EmptyState({ title, description, emoji = '💭' }: EmptyStateProps) {
  return (
    <View className={styles.emptyContainer}>
      <View className={styles.emoji}>{emoji}</View>
      <Text className={styles.title}>{title}</Text>
      {description && <Text className={styles.description}>{description}</Text>}
    </View>
  );
}
