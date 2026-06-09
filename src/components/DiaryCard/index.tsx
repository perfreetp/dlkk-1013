import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { formatRelativeTime } from '@/utils';
import { useAppStore } from '@/store/useAppStore';
import type { Diary } from '@/types';

interface DiaryCardProps {
  diary: Diary;
  onClick?: () => void;
  forceLocked?: boolean;
}

export default function DiaryCard({ diary, onClick, forceLocked }: DiaryCardProps) {
  const unlockedIds = useAppStore((state) => state.unlockedPrivateDiaryIds);
  const isUnlocked = !forceLocked && (!diary.isPrivate || unlockedIds.includes(diary.id));

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/diary-detail/index?id=${diary.id}`
      });
    }
  };

  if (!isUnlocked) {
    return (
      <View className={styles.card} onClick={handleClick}>
        <View
          style={{
            padding: '40rpx 32rpx',
            background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EE 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '240rpx'
          }}
        >
          <Text style={{ fontSize: '72rpx', marginBottom: '16rpx' }}>🔒</Text>
          <Text
            style={{
              fontSize: '30rpx',
              fontWeight: 'bold',
              color: '#FF6B9D',
              marginBottom: '8rpx'
            }}
          >
            私密日记
          </Text>
          <Text style={{ fontSize: '24rpx', color: '#C9CDD4' }}>
            输入密码后查看内容
          </Text>
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '24rpx',
              gap: '24rpx'
            }}
          >
            <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
              👤 {diary.authorName}
            </Text>
            <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
              · {formatRelativeTime(diary.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

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
              <Text>�</Text>
            </View>
          )}
        </View>
        <Text className={styles.excerpt}>
          {diary.content.length > 80 ? diary.content.slice(0, 80) + '...' : diary.content}
        </Text>
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
