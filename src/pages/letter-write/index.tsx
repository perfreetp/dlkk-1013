import React, { useState, useMemo } from 'react';
import { View, Text, Input, Image, Button, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { generateId } from '@/utils';
import type { Letter } from '@/types';

const SCHEDULE_OPTIONS: { key: string; icon: string; label: string; delayHours?: number }[] = [
  { key: 'tonight', icon: '🌙', label: '今晚 22:00', delayHours: 8 },
  { key: 'tomorrow', icon: '☀️', label: '明天早上', delayHours: 12 },
  { key: 'week', icon: '📅', label: '一周后', delayHours: 24 * 7 },
  { key: 'custom', icon: '🕐', label: '自定义时间' }
];

function LetterWritePage() {
  const addLetter = useAppStore((state) => state.addLetter);
  const couple = useAppStore((state) => state.couple);
  const currentUser = useAppStore((state) => state.currentUser);

  useDidShow(() => {
    console.log('[LetterWritePage] Page did show');
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [enableSchedule, setEnableSchedule] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState('tonight');
  const [customTime, setCustomTime] = useState('');

  const otherUser = useMemo(
    () => (currentUser.id === couple.user1.id ? couple.user2 : couple.user1),
    [currentUser.id, couple]
  );

  const handleSend = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请写个标题吧~', icon: 'none' });
      return;
    }
    if (!content.trim()) {
      Taro.showToast({ title: '悄悄话内容不能为空', icon: 'none' });
      return;
    }

    let scheduledSendTime: string | undefined;
    let isSent = true;

    if (enableSchedule) {
      const opt = SCHEDULE_OPTIONS.find((o) => o.key === selectedSchedule);
      if (opt?.delayHours) {
        scheduledSendTime = new Date(Date.now() + opt.delayHours * 3600000)
          .toISOString()
          .replace('T', ' ')
          .slice(0, 19);
        isSent = false;
      } else if (opt?.key === 'custom' && customTime) {
        scheduledSendTime = customTime;
        isSent = false;
      }
    }

    const newLetter: Letter = {
      id: generateId(),
      title: title.trim(),
      content: content.trim(),
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId: otherUser.id,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      scheduledSendTime,
      isSent,
      isRead: false
    };

    addLetter(newLetter);

    if (enableSchedule && scheduledSendTime) {
      Taro.showModal({
        title: '🕐 定时信件已保存',
        content: `这封信将于 ${scheduledSendTime} 发送给 ${otherUser.name}，在此之前你可以随时修改或取消。`,
        showCancel: false,
        confirmText: '知道了',
        success: () => Taro.navigateBack()
      });
    } else {
      Taro.showToast({ title: '💌 信件已送达', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 800);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Taro.showModal({
        title: '确认退出？',
        content: '这封信的内容将不会保存，确认退出吗？',
        success: (res) => {
          if (res.confirm) Taro.navigateBack();
        }
      });
    } else {
      Taro.navigateBack();
    }
  };

  const handleCustomSchedule = () => {
    Taro.showModal({
      title: '设置发送时间',
      editable: true,
      placeholderText: '格式：2025-02-14 00:00:00',
      success: (res) => {
        if (res.confirm && res.content) {
          setCustomTime(res.content);
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.letterPaper}>
        <View className={styles.letterHeader}>
          <View className={styles.toInfo}>
            <Image src={otherUser.avatar} className={styles.toAvatar} mode="aspectFill" />
            <Text className={styles.toText}>
              致 <Text className={styles.toName}>{otherUser.name}</Text>
            </Text>
          </View>
          <Text className={styles.letterStamp}>💮</Text>
        </View>

        <Input
          className={styles.titleInput}
          placeholder="给这封信取个标题吧..."
          placeholderStyle="color: #A89BA9"
          value={title}
          onInput={(e) => setTitle(e.detail.value)}
          maxlength={50}
        />

        <Textarea
          className={styles.contentInput}
          placeholder={`亲爱的 ${otherUser.name}：\n\n在这里写下你想说的悄悄话...\n\n—— ${currentUser.name}`}
          placeholderStyle="color: #A89BA9"
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          maxlength={2000}
          autoHeight
        />
      </View>

      <View className={styles.scheduleCard}>
        <View className={styles.scheduleHeader}>
          <View className={styles.scheduleInfo}>
            <Text className={styles.scheduleTitle}>
              🕐 定时发送
            </Text>
            <Text className={styles.scheduleDesc}>
              设置后信件将在指定时间自动送达
            </Text>
          </View>
          <View
            className={classnames(styles.switchWrap, enableSchedule && styles.active)}
            onClick={() => setEnableSchedule(!enableSchedule)}
          >
            <View className={styles.switchDot} />
          </View>
        </View>

        {enableSchedule && (
          <>
            <View className={styles.scheduleOptions}>
              {SCHEDULE_OPTIONS.map((opt) => (
                <View
                  key={opt.key}
                  className={classnames(
                    styles.scheduleOption,
                    selectedSchedule === opt.key && styles.active
                  )}
                  onClick={() => {
                    setSelectedSchedule(opt.key);
                    if (opt.key === 'custom') handleCustomSchedule();
                  }}
                >
                  <View className={styles.scheduleOptionIcon}>{opt.icon}</View>
                  <Text className={styles.scheduleOptionText}>{opt.label}</Text>
                </View>
              ))}
            </View>
            {selectedSchedule === 'custom' && customTime && (
              <View className={styles.customSchedule}>📅 将在 {customTime} 发送</View>
            )}
          </>
        )}
      </View>

      <View className={styles.tipsCard}>
        <Text className={styles.tipsTitle}>💌 写信小贴士</Text>
        <View className={styles.tipsText}>
          • 信件送达后会有红点提醒，不用担心错过{'\n'}
          • 定时信在发送前可随时撤回和修改{'\n'}
          • 可以在生日、纪念日等特殊日期提前写信哦
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </Button>
        <Button className={styles.sendBtn} onClick={handleSend}>
          {enableSchedule ? '🕐 保存定时信' : '💌 发送信件'}
        </Button>
      </View>
    </View>
  );
}

export default LetterWritePage;
