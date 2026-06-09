import React, { useState } from 'react';
import { View, Text, Input, Button, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { generateId } from '@/utils';
import type { Wish } from '@/types';

type Priority = Wish['priority'];

const PRIORITY_OPTIONS: { key: Priority; emoji: string; label: string }[] = [
  { key: 'low', emoji: '💚', label: '慢慢来' },
  { key: 'medium', emoji: '💛', label: '有空做' },
  { key: 'high', emoji: '❤️', label: '很想实现' }
];

function WishEditPage() {
  const addWish = useAppStore((state) => state.addWish);
  const currentUser = useAppStore((state) => state.currentUser);

  useDidShow(() => {
    console.log('[WishEditPage] Page did show');
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState('');

  const handleChooseDeadline = () => {
    const options = ['一周内', '一个月内', '三个月内', '今年内', '自定义'];
    Taro.showActionSheet({
      itemList: options,
      success: (res) => {
        if (res.tapIndex! < 4) {
          const days = [7, 30, 90, 365];
          const target = new Date(Date.now() + days[res.tapIndex!] * 86400000);
          setDeadline(target.toISOString().slice(0, 10));
        } else {
          Taro.showToast({ title: '请使用 date picker 组件', icon: 'none' });
        }
      }
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入愿望名称', icon: 'none' });
      return;
    }
    if (!description.trim()) {
      Taro.showToast({ title: '请描述一下你的愿望~', icon: 'none' });
      return;
    }

    const newWish: Wish = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      createdBy: currentUser.id,
      status: 'pending',
      priority,
      deadline: deadline || undefined,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    addWish(newWish);
    Taro.showToast({ title: '愿望已添加 🌟', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 800);
  };

  const handleCancel = () => {
    if (title.trim() || description.trim()) {
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

  return (
    <View className={styles.container}>
      <View className={styles.wishTips}>
        <Text className={styles.tipsTitle}>💡 小提示</Text>
        <View className={styles.tipsList}>
          • 愿望会出现在对方的清单里，Ta 可以选择认领哦{'\n'}
          • 选择合适的优先级，让对方知道这个愿望对你有多重要{'\n'}
          • 可以设置截止日期，一起努力实现吧~
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>✨ 愿望名称</Text>
          <Input
            className={styles.formInput}
            placeholder="例如：一起去看极光"
            placeholderStyle="color: #A89BA9"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={30}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>📝 详细描述</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="详细描述一下你的愿望，比如什么时候实现、去哪里..."
            placeholderStyle="color: #A89BA9"
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={300}
            autoHeight
          />
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>🎯 愿望优先级</Text>
          <View className={styles.prioritySelector}>
            {PRIORITY_OPTIONS.map((opt) => (
              <View
                key={opt.key}
                className={classnames(styles.priorityOption, priority === opt.key && styles.active)}
                onClick={() => setPriority(opt.key)}
              >
                <View className={styles.priorityEmoji}>{opt.emoji}</View>
                <Text className={styles.priorityLabel}>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>📅 期望完成时间（可选）</Text>
          <View style={{ position: 'relative' }} onClick={handleChooseDeadline}>
            <Input
              className={styles.deadlineInput}
              placeholder="点击选择期望完成时间"
              placeholderStyle="color: #A89BA9"
              value={deadline}
              disabled
            />
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </Button>
        <Button className={styles.saveBtn} onClick={handleSave}>
          🌟 添加愿望
        </Button>
      </View>
    </View>
  );
}

export default WishEditPage;
