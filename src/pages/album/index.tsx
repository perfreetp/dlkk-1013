import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils';
import PhotoCard from '@/components/PhotoCard';
import EmptyState from '@/components/EmptyState';

type TabType = 'groups' | 'timeline' | 'favorites';

function AlbumPage() {
  const photoGroups = useAppStore((state) => state.photoGroups);
  const photos = useAppStore((state) => state.photos);
  const togglePhotoFavorite = useAppStore((state) => state.togglePhotoFavorite);

  useDidShow(() => {
    console.log('[AlbumPage] Page did show');
  });

  const [activeTab, setActiveTab] = useState<TabType>('groups');

  const photosByDate = useMemo(() => {
    const map = new Map<string, typeof photos>();
    photos.forEach((photo) => {
      const date = formatDate(photo.uploadedAt, 'YYYY年MM月');
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(photo);
    });
    return Array.from(map.entries());
  }, [photos]);

  const favoritePhotos = useMemo(() => photos.filter((p) => p.isFavorite), [photos]);

  const handleGroupClick = (groupId: string, groupName: string) => {
    Taro.navigateTo({
      url: `/pages/album-detail/index?groupId=${groupId}&name=${encodeURIComponent(groupName)}`
    });
  };

  const handlePhotoClick = (photoUrl: string) => {
    Taro.previewImage({
      current: photoUrl,
      urls: photos.map((p) => p.url)
    });
  };

  return (
    <ScrollView scrollY className={styles.container} refresherEnabled>
      <View className={styles.tabs}>
        <Text
          className={classnames(styles.tabItem, activeTab === 'groups' && styles.active)}
          onClick={() => setActiveTab('groups')}
        >
          📁 分组
        </Text>
        <Text
          className={classnames(styles.tabItem, activeTab === 'timeline' && styles.active)}
          onClick={() => setActiveTab('timeline')}
        >
          📅 时间轴
        </Text>
        <Text
          className={classnames(styles.tabItem, activeTab === 'favorites' && styles.active)}
          onClick={() => setActiveTab('favorites')}
        >
          ❤️ 收藏
        </Text>
      </View>

      {activeTab === 'groups' && (
        <>
          <View className={styles.memoryCard}>
            <Text className={styles.memoryLabel}>✨ 回忆卡片</Text>
            <Text className={styles.memoryDate}>一年前的今天</Text>
            <Text className={styles.memoryTitle}>厦门之旅的第一天</Text>
            <Text className={styles.memoryDesc}>
              阳光、海风、还有你的笑容。这一天，我们一起走过了鼓浪屿的大街小巷...
            </Text>
            <View className={styles.memoryPhotos}>
              <View className={styles.memoryPhoto}>
                <Image
                  src="https://picsum.photos/id/1015/400/300"
                  className={styles.groupCoverImg}
                  mode="aspectFill"
                />
              </View>
              <View className={styles.memoryPhoto}>
                <Image
                  src="https://picsum.photos/id/1018/400/300"
                  className={styles.groupCoverImg}
                  mode="aspectFill"
                />
              </View>
              <View className={styles.memoryPhoto}>
                <Image
                  src="https://picsum.photos/id/1036/400/300"
                  className={styles.groupCoverImg}
                  mode="aspectFill"
                />
              </View>
            </View>
          </View>

          {photoGroups.length > 0 ? (
            <View className={styles.groupGrid}>
              {photoGroups.map((group) => (
                <View
                  key={group.id}
                  className={styles.groupCard}
                  onClick={() => handleGroupClick(group.id, group.name)}
                >
                  <View className={styles.groupCover}>
                    <Image
                      src={group.cover}
                      className={styles.groupCoverImg}
                      mode="aspectFill"
                    />
                    <Text className={styles.groupCount}>{group.photoCount}张</Text>
                  </View>
                  <View className={styles.groupInfo}>
                    <Text className={styles.groupName}>{group.name}</Text>
                    <Text className={styles.groupDate}>创建于 {formatDate(group.createdAt)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState emoji="📁" title="还没有相册分组" />
          )}
        </>
      )}

      {activeTab === 'timeline' && (
        <>
          {photosByDate.length > 0 ? (
            photosByDate.map(([date, datePhotos]) => (
              <View key={date} className={styles.timelineSection}>
                <Text className={styles.timelineDate}>{date}</Text>
                <View className={styles.timelineGrid}>
                  {datePhotos.map((photo) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      onClick={() => handlePhotoClick(photo.url)}
                      onFavorite={() => togglePhotoFavorite(photo.id)}
                      size="sm"
                    />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <EmptyState emoji="📅" title="时间轴还是空的" description="快去上传第一张照片吧~" />
          )}
        </>
      )}

      {activeTab === 'favorites' && (
        <>
          <View className={styles.favoritesHeader}>
            <Text style={{ fontSize: '32rpx', fontWeight: '600' }}>❤️ 我的收藏</Text>
            <Text className={styles.favoritesCount}>{favoritePhotos.length}张照片</Text>
          </View>
          {favoritePhotos.length > 0 ? (
            <View className={styles.timelineGrid}>
              {favoritePhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onClick={() => handlePhotoClick(photo.url)}
                  onFavorite={() => togglePhotoFavorite(photo.id)}
                  size="sm"
                />
              ))}
            </View>
          ) : (
            <EmptyState emoji="💔" title="还没有收藏照片" description="遇到喜欢的照片，点一下❤️收藏吧~" />
          )}
        </>
      )}
    </ScrollView>
  );
}

export default AlbumPage;
