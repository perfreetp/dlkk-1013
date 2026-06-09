import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { QuickEntry } from '@/types';

const defaultEntries: QuickEntry[] = [
  { key: 'wishlist', title: '愿望清单', emoji: '🌟', pagePath: '/pages/wishlist/index', color: '#FFC107' },
  { key: 'mailbox', title: '悄悄话', emoji: '💌', pagePath: '/pages/mailbox/index', color: '#FF6B9D' },
  { key: 'settings', title: '设置', emoji: '⚙️', pagePath: '/pages/settings/index', color: '#9C27B0' },
  { key: 'diary-new', title: '写日记', emoji: '✏️', pagePath: '/pages/diary-edit/index', color: '#4CAF50' }
];

interface QuickEntryGridProps {
  entries?: QuickEntry[];
}

export default function QuickEntryGrid({ entries = defaultEntries }: QuickEntryGridProps) {
  const handleClick = (entry: QuickEntry) => {
    if (entry.pagePath) {
      Taro.navigateTo({ url: entry.pagePath });
    }
  };

  return (
    <View className={styles.grid}>
      {entries.map((entry) => (
        <View
          key={entry.key}
          className={styles.item}
          style={{ backgroundColor: `${entry.color}12` }}
          onClick={() => handleClick(entry)}
        >
          <View className={styles.emojiWrap} style={{ backgroundColor: `${entry.color}20` }}>
            <Text className={styles.emoji}>{entry.emoji}</Text>
          </View>
          <Text className={styles.title}>{entry.title}</Text>
        </View>
      ))}
    </View>
  );
}
