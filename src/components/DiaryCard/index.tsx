import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { formatRelativeTime } from '@/utils';
import type { Diary } from '@/types';

interface DiaryCardProps {
  diary: Diary;
  onClick?: () => void;
}

export default function DiaryCard({ diary, onClick }: DiaryCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/diary-detail/index?id=${diary.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      {diary.images && diary.images.length > 0 && (
        <View className={styles.imageWrap}>
          <Image
            src={diary.images[0]}
            className={styles.image}
            mode="aspectFill"
          />
          {diary.images.length > 1 && (
            <View className={styles.imageCount}>
              <Text>+{diary.images.length}</Text>
            </View>
          )}
        </View>
      )}
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.title}>{diary.title}</Text>
          {diary.isPrivate && (
            <View className={styles.privateBadge}>
              <Text>🔒</Text>
            </View>
          )}
        </View>
        <Text className={styles.excerpt}>{diary.content}</Text>
        <View className={styles.footer}>
          <View className={styles.tags}>
            {diary.tags.slice(0, 3).map((tag) => (
              <Text key={tag} className={styles.tag}>#{tag}</Text>
            ))}
          </View>
        </View>
        <View className={styles.meta}>
          <Text className={styles.author}>{diary.authorName}</Text>
          <Text className={styles.time}>{formatRelativeTime(diary.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
}
