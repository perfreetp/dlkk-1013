import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { MOOD_OPTIONS, type MoodType } from '@/types';

interface MoodPickerProps {
  value?: MoodType;
  onChange?: (mood: MoodType) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function MoodPicker({ value, onChange, size = 'md', showLabel = true }: MoodPickerProps) {
  return (
    <View className={classnames(styles.picker, styles[`size-${size}`])}>
      {MOOD_OPTIONS.map((option) => (
        <View
          key={option.type}
          className={classnames(
            styles.option,
            value === option.type && styles.active,
            styles[`size-${size}`]
          )}
          style={value === option.type ? { backgroundColor: `${option.color}20` } : {}}
          onClick={() => onChange?.(option.type)}
        >
          <Text className={classnames(styles.emoji, styles[`emoji-${size}`])}>{option.emoji}</Text>
          {showLabel && (
            <Text
              className={styles.label}
              style={value === option.type ? { color: option.color } : {}}
            >
              {option.label}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
