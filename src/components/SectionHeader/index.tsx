import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionPath?: string;
  showMore?: boolean;
  onAction?: () => void;
}

export default function SectionHeader({
  title,
  subtitle,
  actionText,
  actionPath,
  showMore = true,
  onAction
}: SectionHeaderProps) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionPath) {
      Taro.navigateTo({ url: actionPath });
    }
  };

  return (
    <View className={styles.header}>
      <View className={styles.left}>
        <Text className={styles.title}>{title}</Text>
        {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      </View>
      {showMore && (
        <View className={styles.right} onClick={handleAction}>
          <Text className={styles.action}>{actionText || '更多'}</Text>
          <Text className={styles.arrow}>›</Text>
        </View>
      )}
    </View>
  );
}
