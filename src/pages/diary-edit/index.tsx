import React, { useState, useEffect } from 'react';
import { View, Text, Textarea, Input, Button, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { generateId } from '@/utils';
import type { MoodType, Diary } from '@/types';

const PRESET_TAGS = ['甜蜜', '日常', '旅行', '心动', '美食', '吵架', '未来', '小别扭'];

function DiaryEditPage() {
  const router = useRouter();
  const editId = router.params.id;

  const currentUser = useAppStore((state) => state.currentUser);
  const couple = useAppStore((state) => state.couple);
  const diaries = useAppStore((state) => state.diaries);
  const addDiary = useAppStore((state) => state.addDiary);
  const updateDiary = useAppStore((state) => state.updateDiary);

  const editingDiary = editId ? diaries.find((d) => d.id === editId) : null;
  const isEditMode = !!editingDiary;

  if (isEditMode) {
    Taro.setNavigationBarTitle({ title: '编辑日记' });
  }

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowCoEdit, setAllowCoEdit] = useState(true);
  const [mood] = useState<MoodType>('love');
  const [images] = useState<string[]>([]);

  useEffect(() => {
    if (editingDiary) {
      setTitle(editingDiary.title);
      setContent(editingDiary.content);
      setSelectedTags([...editingDiary.tags]);
      setIsPrivate(editingDiary.isPrivate);
      setAllowCoEdit(!!(editingDiary.coEditors && editingDiary.coEditors.length > 0));
      if (editingDiary.images) editingDiary.images.forEach((img) => images.push(img));
    }
  }, [editingDiary]);

  const otherUser = currentUser.id === couple.user1.id ? couple.user2 : couple.user1;

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setCustomTag('');
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入日记标题', icon: 'none' });
      return;
    }
    if (!content.trim()) {
      Taro.showToast({ title: '请输入日记内容', icon: 'none' });
      return;
    }

    const diaryData: Partial<Diary> = {
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      isPrivate,
      coEditors: allowCoEdit ? [otherUser.id] : [],
      images: images.length > 0 ? images : undefined,
      mood
    };

    if (isEditMode && editingDiary) {
      updateDiary(editingDiary.id, diaryData);
      Taro.showToast({ title: '日记已更新 💝', icon: 'success' });
    } else {
      const newDiary: Diary = {
        id: generateId(),
        title: diaryData.title!,
        content: diaryData.content!,
        authorId: currentUser.id,
        authorName: currentUser.name,
        tags: diaryData.tags!,
        isPrivate: diaryData.isPrivate!,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        images: diaryData.images,
        coEditors: diaryData.coEditors,
        mood
      };
      addDiary(newDiary);
      Taro.showToast({ title: '日记已保存 💝', icon: 'success' });
    }
    setTimeout(() => Taro.navigateBack(), 800);
  };

  const handleCancel = () => {
    const hasChanges =
      (isEditMode
        ? title !== editingDiary!.title ||
          content !== editingDiary!.content ||
          JSON.stringify(selectedTags) !== JSON.stringify(editingDiary!.tags) ||
          isPrivate !== editingDiary!.isPrivate
        : title.trim() || content.trim());

    if (hasChanges) {
      Taro.showModal({
        title: '确认退出？',
        content: '当前内容将不会保存，确认退出吗？',
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
      <View className={styles.inputCard}>
        <Input
          className={styles.titleInput}
          placeholder="今天的标题..."
          placeholderStyle="color: #A89BA9"
          value={title}
          onInput={(e) => setTitle(e.detail.value)}
          maxlength={50}
        />
        <Textarea
          className={styles.contentInput}
          placeholder="写下你们的故事..."
          placeholderStyle="color: #A89BA9"
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          maxlength={2000}
          autoHeight
        />
      </View>

      <View className={styles.tagsCard}>
        <Text className={styles.sectionLabel}>🏷️ 添加标签</Text>
        <View className={styles.tagsWrap}>
          {PRESET_TAGS.map((tag) => (
            <Text
              key={tag}
              className={classnames(styles.tagItem, selectedTags.includes(tag) && styles.active)}
              onClick={() => handleTagToggle(tag)}
            >
              #{tag}
            </Text>
          ))}
          {selectedTags
            .filter((t) => !PRESET_TAGS.includes(t))
            .map((tag) => (
              <Text
                key={tag}
                className={classnames(styles.tagItem, styles.active)}
                onClick={() => handleTagToggle(tag)}
              >
                #{tag}
              </Text>
            ))}
          <Input
            className={styles.customTagInput}
            placeholder="+ 自定义"
            placeholderStyle="color: #A89BA9"
            value={customTag}
            onInput={(e) => setCustomTag(e.detail.value)}
            onConfirm={handleAddCustomTag}
            maxlength={10}
          />
        </View>
      </View>

      <View className={styles.privacyCard}>
        <Text className={styles.sectionLabel}>🔐 私密设置</Text>
        <View
          className={classnames(styles.privacyOption, !isPrivate && styles.active)}
          onClick={() => setIsPrivate(false)}
        >
          <Text className={styles.privacyIcon}>💑</Text>
          <View className={styles.privacyInfo}>
            <Text className={styles.privacyTitle}>共同可见</Text>
            <Text className={styles.privacyDesc}>你们两人都可以查看</Text>
          </View>
          <View className={classnames(styles.checkbox, !isPrivate && styles.active)}>
            {!isPrivate && <Text className={styles.checkmark}>✓</Text>}
          </View>
        </View>
        <View
          className={classnames(styles.privacyOption, isPrivate && styles.active)}
          onClick={() => setIsPrivate(true)}
        >
          <Text className={styles.privacyIcon}>🔒</Text>
          <View className={styles.privacyInfo}>
            <Text className={styles.privacyTitle}>仅自己可见</Text>
            <Text className={styles.privacyDesc}>需要密码才能查看</Text>
          </View>
          <View className={classnames(styles.checkbox, isPrivate && styles.active)}>
            {isPrivate && <Text className={styles.checkmark}>✓</Text>}
          </View>
        </View>
      </View>

      <View className={styles.coEditorCard}>
        <Text className={styles.sectionLabel}>🤝 共同编辑</Text>
        <View
          className={classnames(styles.privacyOption, allowCoEdit && styles.active)}
          onClick={() => setAllowCoEdit(!allowCoEdit)}
        >
          <Image src={otherUser.avatar} className={styles.coEditorAvatar} mode="aspectFill" />
          <View className={styles.privacyInfo}>
            <Text className={styles.privacyTitle}>允许 {otherUser.name} 编辑</Text>
            <Text className={styles.privacyDesc}>Ta可以对这篇日记进行补充和修改</Text>
          </View>
          <View className={classnames(styles.checkbox, allowCoEdit && styles.active)}>
            {allowCoEdit && <Text className={styles.checkmark}>✓</Text>}
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </Button>
        <Button className={styles.saveBtn} onClick={handleSave}>
          💝 {isEditMode ? '更新日记' : '保存日记'}
        </Button>
      </View>
    </View>
  );
}

export default DiaryEditPage;
