import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, generateId } from '@/utils';
import PhotoCard from '@/components/PhotoCard';
import EmptyState from '@/components/EmptyState';
import type { Photo } from '@/types';

function AlbumDetailPage() {
  const router = useRouter();
  const groupId = router.params.groupId;
  const groupName = router.params.name ? decodeURIComponent(router.params.name) : '相册';

  const photos = useAppStore((state) => state.photos);
  const photoGroups = useAppStore((state) => state.photoGroups);
  const togglePhotoFavorite = useAppStore((state) => state.togglePhotoFavorite);
  const addPhotos = useAppStore((state) => state.addPhotos);
  const currentUser = useAppStore((state) => state.currentUser);
  const refreshPhotoGroupStats = useAppStore((state) => state.refreshPhotoGroupStats);

  useDidShow(() => {
    console.log('[AlbumDetailPage] Group ID:', groupId);
    if (groupId) refreshPhotoGroupStats(groupId);
  });

  const group = useMemo(() => photoGroups.find((g) => g.id === groupId), [photoGroups, groupId]);
  const groupPhotos = useMemo(
    () => photos.filter((p) => p.groupId === groupId),
    [photos, groupId]
  );

  const handlePhotoClick = (url: string) => {
    Taro.previewImage({
      current: url,
      urls: groupPhotos.map((p) => p.url)
    });
  };

  const handleUpload = () => {
    Taro.chooseImage({
      count: 9,
      success: (res) => {
        const paths = res.tempFilePaths || (res as any).tempFiles?.map((f: any) => f.path) || [];
        if (paths.length === 0) return;
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const newPhotos: Photo[] = paths.map((p: string) => ({
          id: generateId(),
          url: p,
          uploadedBy: currentUser.id,
          uploadedAt: now,
          isFavorite: false,
          groupId: groupId || undefined
        }));
        addPhotos(newPhotos);
        Taro.showToast({ title: `已添加${newPhotos.length}张照片`, icon: 'success' });
      }
    });
  };

  Taro.setNavigationBarTitle({ title: groupName });

  return (
    <ScrollView scrollY className={styles.container}>
      {group && (
        <View className={styles.groupHeader}>
          <View className={styles.groupCover}>
            <Image src={group.cover} className={styles.groupCoverImg} mode="aspectFill" />
            <Text className={styles.groupCoverCount}>{group.photoCount}张</Text>
          </View>
          <View className={styles.groupInfo}>
            <View style={{ flex: 1 }}>
              <Text className={styles.groupTitle}>{group.name}</Text>
              {group.description && <Text className={styles.groupDesc}>{group.description}</Text>}
              <Text className={styles.groupDate}>创建于 {formatDate(group.createdAt)}</Text>
            </View>
            <View className={styles.groupOptions}>
              <View className={styles.optionBtn}>📝</View>
              <View className={styles.optionBtn}>📤</View>
            </View>
          </View>
        </View>
      )}

      <Text className={styles.sectionTitle}>📷 全部照片</Text>

      {groupPhotos.length > 0 ? (
        <View className={styles.photoGrid}>
          {groupPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => handlePhotoClick(photo.url)}
              onFavorite={() => togglePhotoFavorite(photo.id)}
              size="sm"
            />
          ))}
          <View className={styles.uploadBtn} onClick={handleUpload}>
            <Text className={styles.uploadIcon}>+</Text>
            <Text className={styles.uploadText}>添加</Text>
          </View>
        </View>
      ) : (
        <View style={{ marginBottom: '32rpx' }}>
          <EmptyState emoji="📷" title="这个分组还没有照片" description="点击下方按钮添加照片吧~" />
        </View>
      )}
    </ScrollView>
  );
}

export default AlbumDetailPage;
