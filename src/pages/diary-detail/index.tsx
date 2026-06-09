import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, Button, Input } from '@tarojs/components';
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
  const unlockedPrivateDiaryIds = useAppStore((state) => state.unlockedPrivateDiaryIds);
  const unlockPrivateDiary = useAppStore((state) => state.unlockPrivateDiary);
  const settings = useAppStore((state) => state.settings);

  const diary = useMemo(() => diaries.find((d) => d.id === diaryId), [diaries, diaryId]);
  const isUnlocked = useMemo(
    () => !diary?.isPrivate || unlockedPrivateDiaryIds.includes(diary.id),
    [diary, unlockedPrivateDiaryIds]
  );

  const [showUnlockModal, setShowUnlockModal] = useState(!isUnlocked && !!diary?.isPrivate);
  const [lockInput, setLockInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);

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
    if (diary.isPrivate && !unlockedPrivateDiaryIds.includes(diary.id)) {
      setShowUnlockModal(true);
      return;
    }
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

  const handleUnlock = () => {
    const correctPwd = settings.accessPassword || '1234';
    if (lockInput && lockInput === correctPwd) {
      unlockPrivateDiary(diary.id);
      setShowUnlockModal(false);
      setLockInput('');
      Taro.showToast({ title: '解锁成功', icon: 'success' });
    } else {
      Taro.showToast({ title: '密码错误', icon: 'error' });
    }
  };

  return (
    <ScrollView scrollY className={styles.container}>
      {!isUnlocked && showUnlockModal ? (
        <View
          style={{
            padding: '80rpx 40rpx',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              width: '100%',
              background: '#fff',
              borderRadius: '32rpx',
              padding: '56rpx 40rpx',
              boxShadow: '0 8px 32px rgba(255,107,157,0.25)'
            }}
          >
            <View style={{ textAlign: 'center' }}>
              <View style={{ fontSize: '96rpx', marginBottom: '20rpx' }}>🔒</View>
              <Text
                style={{
                  display: 'block',
                  fontSize: '38rpx',
                  fontWeight: 'bold',
                  color: '#FF6B9D',
                  marginBottom: '12rpx'
                }}
              >
                这是一篇私密日记
              </Text>
              <Text
                style={{
                  display: 'block',
                  fontSize: '26rpx',
                  color: '#86909C',
                  marginBottom: '48rpx'
                }}
              >
                需要验证密码才能查看内容
              </Text>
            </View>
            <Input
              type="password"
              password
              value={lockInput}
              placeholder="请输入访问密码"
              maxlength={6}
              style={{
                width: '100%',
                height: '88rpx',
                lineHeight: '88rpx',
                background: '#F7F8FA',
                borderRadius: '16rpx',
                padding: '0 24rpx',
                fontSize: '30rpx',
                boxSizing: 'border-box',
                marginBottom: '32rpx'
              }}
              onInput={(e) => setLockInput(e.detail.value)}
              onConfirm={handleUnlock}
            />
            <Button
              style={{
                width: '100%',
                height: '88rpx',
                lineHeight: '88rpx',
                background: 'linear-gradient(135deg, #FF6B9D 0%, #FF85B1 100%)',
                color: '#fff',
                borderRadius: '16rpx',
                fontSize: '32rpx',
                fontWeight: 'bold',
                border: 'none'
              }}
              onClick={handleUnlock}
            >
              解锁查看
            </Button>
            <Button
              style={{
                width: '100%',
                height: '80rpx',
                lineHeight: '80rpx',
                marginTop: '16rpx',
                background: 'transparent',
                color: '#86909C',
                border: 'none',
                fontSize: '28rpx'
              }}
              onClick={() => Taro.navigateBack()}
            >
              返回列表
            </Button>
          </View>
        </View>
      ) : (
        <>
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
                    {diary.updatedAt !== diary.createdAt &&
                      ` · 修改于 ${formatDateTime(diary.updatedAt)}`}
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
              {diary.editHistory && diary.editHistory.length > 0 && (
                <View
                  style={{
                    marginTop: '24rpx',
                    padding: '20rpx 24rpx',
                    background: '#F7F8FA',
                    borderRadius: '14rpx',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => setShowHistory(true)}
                >
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                    <Text style={{ fontSize: '32rpx' }}>📝</Text>
                    <Text style={{ fontSize: '26rpx', color: '#4E5969' }}>
                      编辑记录（{diary.editHistory.length}条）
                    </Text>
                  </View>
                  <Text style={{ fontSize: '28rpx', color: '#FF6B9D' }}>查看 ›</Text>
                </View>
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
        </>
      )}

      {showHistory && diary.editHistory && (
        <View
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'flex-end'
          }}
          onClick={() => setShowHistory(false)}
        >
          <View
            style={{
              width: '100%',
              maxHeight: '75vh',
              background: '#fff',
              borderTopLeftRadius: '28rpx',
              borderTopRightRadius: '28rpx',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <View
              style={{
                padding: '32rpx',
                borderBottom: '1rpx solid #F2F3F5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: '32rpx', fontWeight: 'bold', color: '#1D2129' }}>
                📝 编辑记录
              </Text>
              <Text
                style={{ fontSize: '28rpx', color: '#FF6B9D' }}
                onClick={() => setShowHistory(false)}
              >
                关闭
              </Text>
            </View>
            <ScrollView scrollY style={{ flex: 1, padding: '16rpx 32rpx 32rpx' }}>
              {diary.editHistory.map((record) => (
                <View
                  key={record.id}
                  style={{
                    padding: '24rpx',
                    background: '#FFF7FA',
                    borderRadius: '16rpx',
                    marginBottom: '16rpx',
                    borderLeft: '6rpx solid #FF6B9D'
                  }}
                >
                  <View
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12rpx'
                    }}
                  >
                    <Text style={{ fontSize: '28rpx', fontWeight: 'bold', color: '#1D2129' }}>
                      👤 {record.editorName}
                    </Text>
                    <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
                      {record.editedAt}
                    </Text>
                  </View>
                  <Text style={{ fontSize: '26rpx', color: '#4E5969' }}>{record.summary}</Text>
                  <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12rpx', marginTop: '12rpx' }}>
                    {record.fieldsChanged.map((f) => (
                      <View
                        key={f}
                        style={{
                          padding: '6rpx 16rpx',
                          background: '#FFE4EE',
                          borderRadius: '999rpx',
                          fontSize: '22rpx',
                          color: '#FF6B9D'
                        }}
                      >
                        {f === 'title'
                          ? '标题'
                          : f === 'content'
                          ? '正文'
                          : f === 'isPrivate'
                          ? '私密状态'
                          : f === 'tags'
                          ? '标签'
                          : f === 'images'
                          ? '图片'
                          : '共同编辑'}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

export default DiaryDetailPage;
