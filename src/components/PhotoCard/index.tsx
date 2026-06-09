import { View, Image, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Photo } from '@/types';

interface PhotoCardProps {
  photo: Photo;
  onClick?: () => void;
  onFavorite?: () => void;
  size?: 'sm' | 'md';
}

export default function PhotoCard({ photo, onClick, onFavorite, size = 'md' }: PhotoCardProps) {
  return (
    <View
      className={classnames(styles.card, styles[`size-${size}`])}
      onClick={onClick}
    >
      <Image
        src={photo.url}
        className={styles.image}
        mode="aspectFill"
      />
      {photo.isFavorite && (
        <View
          className={styles.favorite}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.();
          }}
        >
          <Text className={styles.favoriteIcon}>❤️</Text>
        </View>
      )}
    </View>
  );
}
