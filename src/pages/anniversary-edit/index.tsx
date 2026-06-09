import React, { useState } from 'react';
import { View, Text, Input, Button, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { generateId, generateBlessing, formatDate } from '@/utils';

const EMOJI_OPTIONS = ['💝', '💕', '💖', '💞', '🎂', '🎈', '🎉', '✈️', '🏠', '💍', '🌸', '⭐'];

function AnniversaryEditPage() {
  const addAnniversary = useAppStore((state) => state.addAnniversary);
  const couple = useAppStore((state) => state.couple);

  useDidShow(() => {
    console.log('[AnniversaryEditPage] Page did show');
  });

  const [type, setType] = useState<'memorial' | 'countdown'>('memorial');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(formatDate(new Date().toISOString()));
  const [repeat, setRepeat] = useState<'none' | 'yearly' | 'monthly'>('yearly');
  const [emoji, setEmoji] = useState('💝');
  const [remind, setRemind] = useState(true);
  const [blessing, setBlessing] = useState(
    generateBlessing('anniversary', [couple.user1.name, couple.user2.name])
  );

  const handleChooseDate = () => {
    const today = new Date();
    Taro.showActionSheet({
      itemList: ['今天', '明天', '一周后', '选择日期'],
      success: (res) => {
        const options = [0, 1, 7];
        if (res.tapIndex! < 3) {
          const target = new Date(today.getTime() + options[res.tapIndex!] * 86400000);
          setDate(formatDate(target.toISOString()));
        } else {
          Taro.showToast({ title: '请使用 date picker 组件', icon: 'none' });
        }
      }
    });
  };

  const handleChooseRepeat = () => {
    Taro.showActionSheet({
      itemList: ['不重复', '每年重复', '每月重复'],
      success: (res) => {
        const options: ('none' | 'yearly' | 'monthly')[] = ['none', 'yearly', 'monthly'];
        setRepeat(options[res.tapIndex!]);
      }
    });
  };

  const handleRefreshBlessing = () => {
    const types = ['anniversary', 'birthday', 'countdown'];
    const t = types[Math.floor(Math.random() * types.length)];
    setBlessing(generateBlessing(t, [couple.user1.name, couple.user2.name]));
    Taro.showToast({ title: '新祝福语已生成 ✨', icon: 'none' });
  };

  const handleSave = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入纪念日名称', icon: 'none' });
      return;
    }

    const newAnniv = {
      id: generateId(),
      title: title.trim(),
      date,
      type,
      repeat,
      emoji,
      remind,
      blessing: blessing.trim()
    };

    addAnniversary(newAnniv);
    Taro.showToast({ title: '纪念日已添加 🎉', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 800);
  };

  const handleCancel = () => {
    if (title.trim()) {
      Taro.showModal({
        title: '确认退出？',
        content: '当前内容将不会保存',
        success: (res) => {
          if (res.confirm) Taro.navigateBack();
        }
      });
    } else {
      Taro.navigateBack();
    }
  };

  const repeatLabel = {
    none: '不重复',
    yearly: '每年重复',
    monthly: '每月重复'
  };

  return (
    <View className={styles.container}>
      <Text className={styles.formLabel} style={{ marginBottom: '16rpx', fontSize: '28rpx' }}>
        📌 选择类型
      </Text>
      <View className={styles.typeSelector}>
        <View
          className={classnames(styles.typeOption, type === 'memorial' && styles.active)}
          onClick={() => setType('memorial')}
        >
          <View className={styles.typeIcon}>💕</View>
          <Text className={styles.typeTitle}>纪念日</Text>
          <Text className={styles.typeDesc}>记录已过去的日子</Text>
        </View>
        <View
          className={classnames(styles.typeOption, type === 'countdown' && styles.active)}
          onClick={() => setType('countdown')}
        >
          <View className={styles.typeIcon}>⏰</View>
          <Text className={styles.typeTitle}>倒计时</Text>
          <Text className={styles.typeDesc}>期待未来的日子</Text>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>名称</Text>
          <Input
            className={styles.formInput}
            placeholder="例如：在一起纪念日"
            placeholderStyle="color: #A89BA9"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={30}
          />
        </View>
        <View className={styles.formItem} onClick={handleChooseDate}>
          <Text className={styles.formLabel}>日期</Text>
          <Text className={styles.formValue}>
            {date}
            <Text className={styles.formArrow}>›</Text>
          </Text>
        </View>
        <View className={styles.formItem} onClick={handleChooseRepeat}>
          <Text className={styles.formLabel}>重复</Text>
          <Text className={styles.formValue}>
            {repeatLabel[repeat]}
            <Text className={styles.formArrow}>›</Text>
          </Text>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>提醒</Text>
          <View
            className={classnames(styles.typeIcon, remind ? styles.active : '')}
            style={{
              fontSize: '32rpx',
              margin: 0,
              padding: '12rpx 24rpx',
              borderRadius: '48rpx',
              background: remind ? 'linear-gradient(135deg, #FF6B9D, #FFB6C1)' : '#F5F6F7',
              color: remind ? '#fff' : '#86909C'
            }}
            onClick={() => setRemind(!remind)}
          >
            {remind ? '✅ 已开启' : '⭕ 未开启'}
          </View>
        </View>
      </View>

      <Text className={styles.formLabel} style={{ marginBottom: '16rpx', fontSize: '28rpx' }}>
        🎨 选择图标
      </Text>
      <View className={styles.formCard} style={{ padding: '24rpx' }}>
        <View className={styles.emojiSelector}>
          {EMOJI_OPTIONS.map((e) => (
            <Text
              key={e}
              className={classnames(styles.emojiItem, emoji === e && styles.active)}
              onClick={() => setEmoji(e)}
            >
              {e}
            </Text>
          ))}
        </View>
      </View>

      <Text className={styles.formLabel} style={{ marginBottom: '16rpx', fontSize: '28rpx' }}>
        💝 祝福语（可选）
      </Text>
      <View className={styles.blessingCard}>
        <View className={styles.blessingHeader}>
          <Text className={styles.blessingLabel}>💫 智能祝福语</Text>
          <Text className={styles.refreshBtn} onClick={handleRefreshBlessing}>
            🔄 换一句
          </Text>
        </View>
        <Textarea
          className={styles.blessingInput}
          value={blessing}
          onInput={(e) => setBlessing(e.detail.value)}
          maxlength={100}
          placeholder="输入一句祝福语..."
          placeholderStyle="color: #A89BA9"
        />
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </Button>
        <Button className={styles.saveBtn} onClick={handleSave}>
          🎉 保存纪念日
        </Button>
      </View>
    </View>
  );
}

export default AnniversaryEditPage;
