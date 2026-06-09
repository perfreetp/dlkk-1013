import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime } from '@/utils';

function DiaryDetailPage() {
  const router = useRouter();
  const diaryId = router.params.id;

  const diaries = useAppStore((state) => state.diaries);
  const deleteDiary = useAppStore((state) => state.deleteDiary);
  const couple = useAppStore((state) => state.couple);

  const diary = useMemo(() => diaries.find((d) => d.id === diaryId), [diaries, diaryId]);

  if (!diary) {
    return (
      <View className={styles.container}>
        <Text>日记不存在</Text>
      </View>
    );
  }

  const coEditorName =
    diary.coEditors && diary.coEditors.length > 0
      ? couple.user1.id === diary.coEditors[0]
        ? couple.user1.name
        : couple.user2.name
      : null;

  const handleEdit = () => {
    Taro.navigateTo({
      url: `/pages/diary-edit/index?id=${diary.id}`
    });
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '删除日记？',
      content: '这篇日记将被永久删除，确认吗？',
      confirmText: '删除',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          deleteDiary(diary.id);
          Taro.showToast({ title: '已删除', icon: 'none' });
          setTimeout(() => Taro.navigateBack(), 500);
        }
      }
    });
  };

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.diaryCard}>
        {diary.images && diary.images.length > 0 && (
          <View className={styles.diaryImages}>
            {diary.images.map((img, idx) => (
              <Image
                key={idx}
                src={img}
                className={styles.diaryImage}
                mode="widthFix"
                onClick={() => Taro.previewImage({ urls: diary.images!, current: img })}
              />
            ))}
          </View>
        )}
        <View className={styles.diaryContent}>
          <Text className={styles.diaryTitle}>{diary.title}</Text>
          <View className={styles.diaryMeta}>
            <Image
              src={
                diary.authorId === couple.user1.id ? couple.user1.avatar : couple.user2.avatar
              }
              className={styles.authorAvatar}
              mode="aspectFill"
            />
            <View className={styles.authorInfo}>
              <Text className={styles.authorName}>{diary.authorName}</Text>
              <Text className={styles.diaryTime}>
                {formatDateTime(diary.createdAt)}
                {diary.updatedAt !== diary.createdAt && ` · 修改于 ${formatDateTime(diary.updatedAt)}`}
              </Text>
            </View>
            {diary.isPrivate && <Text className={styles.privateBadge}>🔒 私密</Text>}
          </View>
          <Text className={styles.diaryText}>{diary.content}</Text>
          {diary.tags.length > 0 && (
            <View className={styles.tagsWrap}>
              {diary.tags.map((tag) => (
                <Text key={tag} className={styles.tagItem}>
                  #{tag}
                </Text>
              ))}
            </View>
          )}
          {coEditorName && (
            <Text className={styles.coEditorNote}>
              🤝 {coEditorName} 也可以编辑这篇日记
            </Text>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.editBtn} onClick={handleEdit}>
          ✏️ 编辑日记
        </Button>
        <Button className={styles.deleteBtn} onClick={handleDelete}>
          🗑️ 删除
        </Button>
      </View>
    </ScrollView>
  );
}

export default DiaryDetailPage;
