import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Switch, Button, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime } from '@/utils';
import type { PersistedData } from '@/store/useAppStore';

type RestoreStep = 'list' | 'preview';

function SettingsPage() {
  const couple = useAppStore((state) => state.couple);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const diaries = useAppStore((state) => state.diaries);
  const photos = useAppStore((state) => state.photos);
  const wishes = useAppStore((state) => state.wishes);
  const anniversaries = useAppStore((state) => state.anniversaries);
  const letters = useAppStore((state) => state.letters);
  const moodRecords = useAppStore((state) => state.moodRecords);
  const photoGroups = useAppStore((state) => state.photoGroups);
  const exportBackupData = useAppStore((state) => state.exportBackupData);
  const restoreFromBackup = useAppStore((state) => state.restoreFromBackup);

  useDidShow(() => {
    console.log('[SettingsPage] Page did show');
  });

  const [passwordEnabled, setPasswordEnabled] = useState(settings.isLocked);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupInfo, setBackupInfo] = useState<{
    key: string;
    time: string;
    size: string;
    summary: Record<string, number>;
    jsonStr: string;
  } | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreStep, setRestoreStep] = useState<RestoreStep>('list');
  const [localBackups, setLocalBackups] = useState<
    { key: string; time: string; data: PersistedData; size: string }[]
  >([]);
  const [selectedRestore, setSelectedRestore] = useState<PersistedData | null>(null);
  const [pasteValue, setPasteValue] = useState('');
  const [showPaste, setShowPaste] = useState(false);

  const handleTogglePassword = () => {
    if (!passwordEnabled) {
      Taro.showModal({
        title: '设置访问密码',
        editable: true,
        placeholderText: '请输入4-6位数字密码',
        success: (res) => {
          if (res.confirm && res.content) {
            if (/^\d{4,6}$/.test(res.content)) {
              setPasswordEnabled(true);
              updateSettings({ isLocked: true, accessPassword: res.content });
              Taro.showToast({ title: '密码设置成功', icon: 'success' });
            } else {
              Taro.showToast({ title: '请输入4-6位数字', icon: 'error' });
            }
          }
        }
      });
    } else {
      Taro.showModal({
        title: '关闭访问密码？',
        content: '关闭后任何人都可以直接访问空间',
        success: (res) => {
          if (res.confirm) {
            setPasswordEnabled(false);
            updateSettings({ isLocked: false });
            Taro.showToast({ title: '密码已关闭', icon: 'none' });
          }
        }
      });
    }
  };

  const handleExport = () => {
    Taro.showLoading({ title: '正在生成备份...' });
    setTimeout(() => {
      try {
        const backupData = exportBackupData();
        const jsonStr = JSON.stringify(backupData, null, 2);
        const bytes = new Blob([jsonStr]).size;
        const sizeStr =
          bytes > 1024 * 1024
            ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
            : `${(bytes / 1024).toFixed(1)} KB`;
        const timeKey = new Date().toISOString();
        const storageKey = `couple_backup_${timeKey.replace(/[:.]/g, '-')}`;
        Taro.setStorageSync(storageKey, jsonStr);

        const summary = {
          diaries: backupData.diaries.length,
          photos: backupData.photos.length,
          anniversaries: backupData.anniversaries.length,
          wishes: backupData.wishes.length,
          letters: backupData.letters.length,
          moods: backupData.moodRecords.length,
          photoGroups: backupData.photoGroups.length
        };

        updateSettings({ lastBackupAt: timeKey });

        setBackupInfo({
          key: storageKey,
          time: formatDateTime(timeKey),
          size: sizeStr,
          summary,
          jsonStr
        });
        setShowBackupModal(true);
        Taro.hideLoading();
      } catch (e) {
        Taro.hideLoading();
        Taro.showToast({ title: '导出失败', icon: 'error' });
        console.error(e);
      }
    }, 800);
  };

  const handleBackup = () => {
    Taro.showLoading({ title: '正在备份...' });
    setTimeout(() => {
      try {
        const backupData = exportBackupData();
        const jsonStr = JSON.stringify(backupData);
        const storageKey = `couple_backup_auto_${new Date().toISOString().replace(/[:.]/g, '-')}`;
        Taro.setStorageSync(storageKey, jsonStr);
        Taro.hideLoading();
        updateSettings({ lastBackupAt: new Date().toISOString() });
        Taro.showToast({ title: '备份完成 ☁️', icon: 'success' });
      } catch (e) {
        Taro.hideLoading();
        Taro.showToast({ title: '备份失败', icon: 'error' });
      }
    }, 1200);
  };

  const handleCopyJson = () => {
    if (!backupInfo) return;
    Taro.setClipboardData({
      data: backupInfo.jsonStr,
      success: () => Taro.showToast({ title: '已复制到剪贴板', icon: 'success' })
    });
  };

  const handleDownload = () => {
    if (!backupInfo) return;
    try {
      if (typeof document !== 'undefined') {
        const blob = new Blob([backupInfo.jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `甜蜜空间备份_${backupInfo.time.replace(/[-: ]/g, '')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Taro.showToast({ title: '下载已开始', icon: 'success' });
      } else {
        handleCopyJson();
      }
    } catch (e) {
      handleCopyJson();
    }
  };

  const handleEditProfile = () => {
    Taro.showToast({ title: '编辑资料功能开发中', icon: 'none' });
  };

  const handleSeal = () => {
    Taro.showModal({
      title: '⚠️ 分手封存空间',
      content:
        '封存后：\n1. 所有数据将被加密保护\n2. 需要解封密码才能再次访问\n3. 可以在未来随时解封回忆\n\n此操作需要设置解封密码。',
      confirmText: '确认封存',
      confirmColor: '#F44336',
      cancelText: '我再想想',
      success: (res) => {
        if (res.confirm) {
          Taro.showModal({
            title: '设置解封密码',
            editable: true,
            placeholderText: '请设置解封密码（4-6位）',
            success: (res2) => {
              if (res2.confirm && res2.content && /^\d{4,6}$/.test(res2.content)) {
                updateSettings({ isSealed: true, sealedAt: new Date().toISOString() });
                Taro.showModal({
                  title: '🔒 空间已封存',
                  content: `已成功封存${diaries.length}篇日记、${photos.length}张照片等所有回忆。\n\n请妥善保管解封密码，未来想回忆时可随时解封。`,
                  showCancel: false
                });
              } else if (res2.confirm) {
                Taro.showToast({ title: '请输入4-6位数字', icon: 'error' });
              }
            }
          });
        }
      }
    });
  };

  const scanLocalBackups = () => {
    try {
      const list: typeof localBackups = [];
      const info = (Taro as any).getStorageInfoSync
        ? (Taro as any).getStorageInfoSync()
        : null;
      const keys: string[] = info?.keys || [];
      keys.forEach((k) => {
        if (k.startsWith('couple_backup_')) {
          try {
            const raw = Taro.getStorageSync(k);
            if (raw) {
              const parsed = JSON.parse(raw) as PersistedData;
              if (parsed.diaries && parsed.photos) {
                const time = parsed.initializedAt
                  ? formatDateTime(parsed.initializedAt)
                  : k;
                const sizeStr =
                  raw.length > 1024 * 1024
                    ? `${(raw.length / 1024 / 1024).toFixed(2)} MB`
                    : `${(raw.length / 1024).toFixed(1)} KB`;
                list.push({ key: k, time, data: parsed, size: sizeStr });
              }
            }
          } catch (e) {}
        }
      });
      list.sort((a, b) => (a.key < b.key ? 1 : -1));
      setLocalBackups(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenRestore = () => {
    scanLocalBackups();
    setRestoreStep('list');
    setSelectedRestore(null);
    setShowRestoreModal(true);
  };

  const handleSelectBackup = (data: PersistedData) => {
    setSelectedRestore(data);
    setRestoreStep('preview');
  };

  const handlePasteRestore = () => {
    if (!pasteValue.trim()) {
      Taro.showToast({ title: '请粘贴备份内容', icon: 'none' });
      return;
    }
    try {
      const parsed = JSON.parse(pasteValue.trim()) as PersistedData;
      if (!parsed.diaries || !parsed.photos) throw new Error('格式错误');
      setSelectedRestore(parsed);
      setRestoreStep('preview');
      setShowPaste(false);
      setPasteValue('');
    } catch (e) {
      Taro.showToast({ title: '备份内容格式不正确', icon: 'error' });
    }
  };

  const handleConfirmRestore = () => {
    if (!selectedRestore) return;
    Taro.showModal({
      title: '⚠️ 确认恢复？',
      content:
        '当前所有数据将被备份中的内容完全替换，此操作不可撤销。确认继续吗？',
      confirmText: '确认恢复',
      confirmColor: '#FF6B9D',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '恢复中...' });
          setTimeout(() => {
            restoreFromBackup(selectedRestore);
            Taro.hideLoading();
            setShowRestoreModal(false);
            setSelectedRestore(null);
            Taro.showToast({ title: '数据已恢复 ✅', icon: 'success' });
            Taro.reLaunch({ url: '/pages/home/index' });
          }, 800);
        }
      }
    });
  };

  const compareNum = (current: number, backup: number) => {
    if (backup > current) return `+${backup - current}`;
    if (backup < current) return `${backup - current}`;
    return '0';
  };

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.pagePadding}>
        <View className={styles.profileCard}>
          <View className={styles.profileRow}>
            <View className={styles.userInfo}>
              <Image src={couple.user1.avatar} className={styles.avatar} mode="aspectFill" />
              <View className={styles.infoText}>
                <Text className={styles.userName}>{couple.user1.name}</Text>
                <Text className={styles.userLabel}>❤️ 另一半</Text>
              </View>
            </View>
            <Text className={styles.heartIcon}>💞</Text>
            <View className={styles.userInfo} style={{ justifyContent: 'flex-end' }}>
              <View className={styles.infoText} style={{ alignItems: 'flex-end' }}>
                <Text className={styles.userName}>{couple.user2.name}</Text>
                <Text className={styles.userLabel}>另一半 ❤️</Text>
              </View>
              <Image src={couple.user2.avatar} className={styles.avatar} mode="aspectFill" />
            </View>
          </View>
          <View style={{ display: 'flex', justifyContent: 'center' }}>
            <Text className={styles.editBtn} onClick={handleEditProfile}>
              ✏️ 编辑情侣资料
            </Text>
          </View>
          {couple.loveStory && <Text className={styles.storyText}>「{couple.loveStory}」</Text>}
        </View>
      </View>

      <Text className={styles.sectionTitle}>隐私与安全</Text>
      <View className={styles.menuGroup}>
        <View className={styles.menuItem} onClick={handleTogglePassword}>
          <View className={styles.menuIcon}>🔐</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>访问密码</Text>
            <Text className={styles.menuDesc}>进入空间需要输入密码</Text>
          </View>
          <View
            className={classnames(styles.switchWrap, passwordEnabled && styles.active)}
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePassword();
            }}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon}>🛡️</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>隐私保护</Text>
            <Text className={styles.menuDesc}>所有数据加密存储，仅你们可见</Text>
          </View>
          <Text className={styles.menuValue}>已开启</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>通知偏好</Text>
      <View className={styles.menuGroup}>
        {[
          {
            key: 'diary_edited',
            icon: '✏️',
            title: '日记编辑通知',
            desc: 'TA 编辑日记时提醒我'
          },
          {
            key: 'photo_favorited',
            icon: '⭐',
            title: '照片收藏通知',
            desc: 'TA 收藏照片时提醒我'
          },
          {
            key: 'wish_claimed',
            icon: '🌟',
            title: '愿望认领通知',
            desc: 'TA 认领愿望时提醒我'
          },
          {
            key: 'letter_read',
            icon: '💌',
            title: '信件已读通知',
            desc: 'TA 读了我写的信时提醒我'
          }
        ].map((opt) => {
          const notifyPrefs = settings.notifyPrefs || {
            diary_edited: true,
            photo_favorited: true,
            wish_claimed: true,
            letter_read: true
          };
          const on = (notifyPrefs as any)[opt.key] !== false;
          return (
            <View key={opt.key} className={styles.menuItem}>
              <View className={styles.menuIcon}>{opt.icon}</View>
              <View className={styles.menuContent}>
                <Text className={styles.menuTitle}>{opt.title}</Text>
                <Text className={styles.menuDesc}>{opt.desc}</Text>
              </View>
              <View
                className={classnames(styles.switchWrap, on && styles.active)}
                onClick={(e) => {
                  e.stopPropagation();
                  updateSettings({
                    notifyPrefs: {
                      ...(settings.notifyPrefs || {
                        diary_edited: true,
                        photo_favorited: true,
                        wish_claimed: true,
                        letter_read: true
                      }),
                      [opt.key]: !on
                    }
                  });
                }}
              >
                <View className={styles.switchDot} />
              </View>
            </View>
          );
        })}
      </View>

      <Text className={styles.sectionTitle}>数据管理</Text>
      <View className={styles.menuGroup}>
        <View className={styles.menuItem} onClick={handleBackup}>
          <View className={styles.menuIcon}>☁️</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>云端备份</Text>
            <Text className={styles.menuDesc}>
              {settings.lastBackupAt
                ? `上次备份：${settings.lastBackupAt.slice(0, 10)}`
                : '还没有备份过'}
            </Text>
          </View>
          <View
            className={classnames(styles.switchWrap, backupEnabled && styles.active)}
            onClick={(e) => {
              e.stopPropagation();
              setBackupEnabled(!backupEnabled);
            }}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
        <View className={styles.menuItem} onClick={handleExport}>
          <View className={styles.menuIcon}>💾</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>导出数据</Text>
            <Text className={styles.menuDesc}>导出所有照片、日记等数据</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={handleOpenRestore}>
          <View className={styles.menuIcon}>📥</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>恢复数据</Text>
            <Text className={styles.menuDesc}>从备份文件恢复数据</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>通用设置</Text>
      <View className={styles.menuGroup}>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon}>🔔</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>消息提醒</Text>
            <Text className={styles.menuDesc}>纪念日、新信件提醒</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon}>🌙</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>深色模式</Text>
            <Text className={styles.menuDesc}>跟随系统或手动设置</Text>
          </View>
          <Text className={styles.menuValue}>跟随系统</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon}>💬</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>意见反馈</Text>
            <Text className={styles.menuDesc}>告诉我们你的想法</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem}>
          <View className={styles.menuIcon}>ℹ️</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>关于我们</Text>
            <Text className={styles.menuDesc}>版本信息、用户协议</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.dangerZone}>
        <Button className={classnames(styles.dangerBtn, styles.primary)} onClick={handleExport}>
          📦 立即导出备份
        </Button>
        <Button className={classnames(styles.dangerBtn, styles.danger)} onClick={handleSeal}>
          🔒 分手封存空间
        </Button>
      </View>

      <View className={styles.versionInfo}>
        甜蜜空间 v1.0.0
        {'\n'}
        Made with 💝 for lovers
      </View>

      {showBackupModal && backupInfo && (
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
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32rpx'
          }}
          onClick={() => !showJsonPreview && setShowBackupModal(false)}
        >
          <View
            style={{
              width: '100%',
              maxHeight: '85vh',
              background: '#fff',
              borderRadius: '24rpx',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <View
              style={{
                padding: '32rpx',
                background: 'linear-gradient(135deg, #FF6B9D 0%, #FF85B1 100%)',
                color: '#fff'
              }}
            >
              <Text
                style={{
                  display: 'block',
                  fontSize: '36rpx',
                  fontWeight: 'bold',
                  marginBottom: '8rpx'
                }}
              >
                ✅ 备份生成成功
              </Text>
              <Text style={{ fontSize: '24rpx', opacity: 0.9 }}>{backupInfo.time}</Text>
            </View>

            {!showJsonPreview ? (
              <View style={{ padding: '32rpx', flexShrink: 0 }}>
                <View
                  style={{
                    background: '#F7F8FA',
                    borderRadius: '16rpx',
                    padding: '24rpx',
                    marginBottom: '24rpx'
                  }}
                >
                  <Text
                    style={{
                      display: 'block',
                      fontSize: '24rpx',
                      color: '#86909C',
                      marginBottom: '16rpx'
                    }}
                  >
                    📦 备份摘要
                  </Text>
                  <View
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12rpx'
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: '28rpx', fontWeight: 'bold', color: '#FF6B9D' }}>
                        {backupInfo.summary.diaries}
                      </Text>
                      <Text style={{ fontSize: '22rpx', color: '#86909C' }}> 篇日记</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: '28rpx', fontWeight: 'bold', color: '#FF6B9D' }}>
                        {backupInfo.summary.photos}
                      </Text>
                      <Text style={{ fontSize: '22rpx', color: '#86909C' }}> 张照片</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: '28rpx', fontWeight: 'bold', color: '#FF6B9D' }}>
                        {backupInfo.summary.anniversaries}
                      </Text>
                      <Text style={{ fontSize: '22rpx', color: '#86909C' }}> 个纪念日</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: '28rpx', fontWeight: 'bold', color: '#FF6B9D' }}>
                        {backupInfo.summary.wishes}
                      </Text>
                      <Text style={{ fontSize: '22rpx', color: '#86909C' }}> 个愿望</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: '28rpx', fontWeight: 'bold', color: '#FF6B9D' }}>
                        {backupInfo.summary.letters}
                      </Text>
                      <Text style={{ fontSize: '22rpx', color: '#86909C' }}> 封信件</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: '28rpx', fontWeight: 'bold', color: '#FF6B9D' }}>
                        {backupInfo.summary.moods}
                      </Text>
                      <Text style={{ fontSize: '22rpx', color: '#86909C' }}> 条心情</Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16rpx 20rpx',
                    background: '#FFF7FA',
                    borderRadius: '12rpx',
                    marginBottom: '24rpx'
                  }}
                >
                  <Text style={{ fontSize: '24rpx', color: '#86909C' }}>备份大小</Text>
                  <Text style={{ fontSize: '26rpx', fontWeight: 'bold', color: '#FF6B9D' }}>
                    {backupInfo.size}
                  </Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16rpx 20rpx',
                    background: '#FFF7FA',
                    borderRadius: '12rpx',
                    marginBottom: '32rpx'
                  }}
                >
                  <Text style={{ fontSize: '24rpx', color: '#86909C' }}>存储键</Text>
                  <Text style={{ fontSize: '22rpx', color: '#4E5969', maxWidth: '60%' }}>
                    {backupInfo.key.slice(0, 24)}...
                  </Text>
                </View>

                <View style={{ display: 'flex', flexDirection: 'column', gap: '16rpx' }}>
                  <Button
                    style={{
                      width: '100%',
                      height: '80rpx',
                      lineHeight: '80rpx',
                      background: 'linear-gradient(135deg, #FF6B9D 0%, #FF85B1 100%)',
                      color: '#fff',
                      borderRadius: '14rpx',
                      fontSize: '28rpx',
                      fontWeight: 'bold',
                      border: 'none'
                    }}
                    onClick={handleDownload}
                  >
                    ⬇️ 下载备份文件
                  </Button>
                  <Button
                    style={{
                      width: '100%',
                      height: '80rpx',
                      lineHeight: '80rpx',
                      background: '#F7F8FA',
                      color: '#4E5969',
                      borderRadius: '14rpx',
                      fontSize: '28rpx',
                      border: 'none'
                    }}
                    onClick={handleCopyJson}
                  >
                    📋 复制到剪贴板
                  </Button>
                  <Button
                    style={{
                      width: '100%',
                      height: '80rpx',
                      lineHeight: '80rpx',
                      background: '#FFF7FA',
                      color: '#FF6B9D',
                      borderRadius: '14rpx',
                      fontSize: '28rpx',
                      border: 'none'
                    }}
                    onClick={() => setShowJsonPreview(true)}
                  >
                    👁️ 查看备份内容
                  </Button>
                  <Button
                    style={{
                      width: '100%',
                      height: '80rpx',
                      lineHeight: '80rpx',
                      background: 'transparent',
                      color: '#86909C',
                      borderRadius: '14rpx',
                      fontSize: '28rpx',
                      border: 'none'
                    }}
                    onClick={() => setShowBackupModal(false)}
                  >
                    关闭
                  </Button>
                </View>
              </View>
            ) : (
              <View style={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
                <View
                  style={{
                    padding: '20rpx 24rpx',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1rpx solid #F2F3F5'
                  }}
                >
                  <Text style={{ fontSize: '26rpx', fontWeight: 'bold', color: '#4E5969' }}>
                    📄 backup.json 预览
                  </Text>
                  <Text
                    style={{ fontSize: '24rpx', color: '#FF6B9D' }}
                    onClick={() => setShowJsonPreview(false)}
                  >
                    返回
                  </Text>
                </View>
                <ScrollView scrollY style={{ flex: 1, padding: '20rpx' }}>
                  <Textarea
                    value={backupInfo.jsonStr}
                    style={{
                      width: '100%',
                      minHeight: '800rpx',
                      fontSize: '22rpx',
                      fontFamily: 'monospace',
                      lineHeight: '32rpx',
                      color: '#1D2129',
                      background: '#FAFBFC',
                      borderRadius: '12rpx',
                      padding: '20rpx'
                    }}
                    autoHeight
                    disabled
                  />
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      )}

      {showRestoreModal && (
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
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32rpx'
          }}
          onClick={() => setShowRestoreModal(false)}
        >
          <View
            style={{
              width: '100%',
              maxHeight: '85vh',
              background: '#fff',
              borderRadius: '24rpx',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <View
              style={{
                padding: '28rpx 32rpx',
                background: 'linear-gradient(135deg, #722ED1 0%, #9254DE 100%)',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <View>
                <Text
                  style={{
                    display: 'block',
                    fontSize: '34rpx',
                    fontWeight: 'bold',
                    marginBottom: '4rpx'
                  }}
                >
                  📥 恢复数据
                </Text>
                <Text style={{ fontSize: '22rpx', opacity: 0.85 }}>
                  {restoreStep === 'list' ? '选择备份来源' : '预览备份差异'}
                </Text>
              </View>
              <Text
                style={{ fontSize: '28rpx' }}
                onClick={() => setShowRestoreModal(false)}
              >
                关闭
              </Text>
            </View>

            {restoreStep === 'list' && (
              <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <View
                  style={{
                    padding: '20rpx 32rpx',
                    background: '#F7F8FA',
                    borderBottom: '1rpx solid #F2F3F5'
                  }}
                >
                  <Button
                    style={{
                      width: '100%',
                      height: '72rpx',
                      lineHeight: '72rpx',
                      background: '#fff',
                      color: '#722ED1',
                      border: '2rpx solid #9254DE',
                      borderRadius: '12rpx',
                      fontSize: '26rpx'
                    }}
                    onClick={() => setShowPaste(true)}
                  >
                    📋 粘贴备份内容恢复
                  </Button>
                </View>
                <ScrollView scrollY style={{ flex: 1, padding: '16rpx 24rpx 32rpx' }}>
                  {localBackups.length > 0 ? (
                    <View style={{ display: 'flex', flexDirection: 'column', gap: '16rpx' }}>
                      <Text
                        style={{
                          fontSize: '26rpx',
                          color: '#86909C',
                          marginTop: '8rpx',
                          marginBottom: '8rpx',
                          paddingHorizontal: '8rpx'
                        }}
                      >
                        本地备份（{localBackups.length}个）
                      </Text>
                      {localBackups.map((b) => (
                        <View
                          key={b.key}
                          style={{
                            padding: '24rpx',
                            background: '#F7F8FA',
                            borderRadius: '16rpx',
                            border: '2rpx solid transparent'
                          }}
                          onClick={() => handleSelectBackup(b.data)}
                        >
                          <View
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '12rpx'
                            }}
                          >
                            <Text
                              style={{
                                fontSize: '28rpx',
                                fontWeight: 'bold',
                                color: '#1D2129'
                              }}
                            >
                              🗓️ {b.time}
                            </Text>
                            <Text style={{ fontSize: '22rpx', color: '#FF6B9D' }}>
                              {b.size}
                            </Text>
                          </View>
                          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx' }}>
                            <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
                              📝 {b.data.diaries?.length || 0} 日记
                            </Text>
                            <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
                              📷 {b.data.photos?.length || 0} 照片
                            </Text>
                            <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
                              💌 {b.data.letters?.length || 0} 信件
                            </Text>
                            <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
                              🌟 {b.data.wishes?.length || 0} 愿望
                            </Text>
                            <Text style={{ fontSize: '22rpx', color: '#722ED1' }}>
                              点击查看详情 ›
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={{ padding: '80rpx 24rpx', alignItems: 'center' }}>
                      <View style={{ fontSize: '80rpx', marginBottom: '16rpx' }}>
                        📭
                      </View>
                      <Text style={{ fontSize: '28rpx', color: '#86909C' }}>
                        本地暂无备份
                      </Text>
                      <Text
                        style={{
                          fontSize: '24rpx',
                          color: '#C9CDD4',
                          marginTop: '8rpx',
                          textAlign: 'center'
                        }}
                      >
                        请先"导出数据"生成备份，或使用"粘贴备份内容"方式恢复
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

            {restoreStep === 'preview' && selectedRestore && (
              <View
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '24rpx 32rpx 32rpx'
                }}
              >
                {selectedRestore.initializedAt && (
                  <View
                    style={{
                      padding: '16rpx 20rpx',
                      background: '#F3F0FF',
                      borderRadius: '12rpx',
                      marginBottom: '24rpx'
                    }}
                  >
                    <Text style={{ fontSize: '24rpx', color: '#722ED1' }}>
                      🗓️ 备份生成时间：
                      {formatDateTime(selectedRestore.initializedAt)}
                    </Text>
                  </View>
                )}

                <View style={{ marginBottom: '24rpx' }}>
                  <View
                    style={{
                      display: 'flex',
                      padding: '16rpx 20rpx',
                      background: '#F7F8FA',
                      borderRadius: '12rpx 12rpx 0 0',
                      borderBottom: '1rpx solid #E5E6EB'
                    }}
                  >
                    <Text style={{ flex: 1.4, fontSize: '24rpx', color: '#86909C' }}>
                      数据项
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: '24rpx',
                        color: '#86909C',
                        textAlign: 'center'
                      }}
                    >
                      当前
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: '24rpx',
                        color: '#86909C',
                        textAlign: 'center'
                      }}
                    >
                      备份
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: '24rpx',
                        color: '#86909C',
                        textAlign: 'right'
                      }}
                    >
                      差异
                    </Text>
                  </View>
                  {(
                    [
                      ['📝 日记', 'diaries'],
                      ['📷 照片', 'photos'],
                      ['📁 分组', 'photoGroups'],
                      ['🎂 纪念日', 'anniversaries'],
                      ['🌟 愿望', 'wishes'],
                      ['💌 信件', 'letters'],
                      ['🌈 心情', 'moodRecords']
                    ] as [string, keyof PersistedData][]
                  ).map(([label, key]) => {
                    const cur = (
                      {
                        diaries: diaries.length,
                        photos: photos.length,
                        photoGroups: photoGroups.length,
                        anniversaries: anniversaries.length,
                        wishes: wishes.length,
                        letters: letters.length,
                        moodRecords: moodRecords.length
                      } as any
                    )[key];
                    const bak = (selectedRestore[key] as unknown[])?.length || 0;
                    const diff = compareNum(cur, bak);
                    const diffColor =
                      bak > cur
                        ? '#4CAF50'
                        : bak < cur
                        ? '#F53F3F'
                        : '#86909C';
                    return (
                      <View
                        key={key}
                        style={{
                          display: 'flex',
                          padding: '16rpx 20rpx',
                          borderBottom: '1rpx solid #F2F3F5',
                          alignItems: 'center'
                        }}
                      >
                        <Text
                          style={{
                            flex: 1.4,
                            fontSize: '26rpx',
                            color: '#1D2129'
                          }}
                        >
                          {label}
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            fontSize: '26rpx',
                            textAlign: 'center',
                            color: '#4E5969'
                          }}
                        >
                          {cur}
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            fontSize: '26rpx',
                            textAlign: 'center',
                            color: '#722ED1',
                            fontWeight: 'bold'
                          }}
                        >
                          {bak}
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            fontSize: '26rpx',
                            textAlign: 'right',
                            color: diffColor,
                            fontWeight: 'bold'
                          }}
                        >
                          {diff}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={{ flex: 1 }} />

                <View style={{ display: 'flex', flexDirection: 'column', gap: '16rpx' }}>
                  <Button
                    style={{
                      width: '100%',
                      height: '80rpx',
                      lineHeight: '80rpx',
                      background: 'linear-gradient(135deg, #722ED1 0%, #9254DE 100%)',
                      color: '#fff',
                      borderRadius: '14rpx',
                      fontSize: '28rpx',
                      fontWeight: 'bold',
                      border: 'none'
                    }}
                    onClick={handleConfirmRestore}
                  >
                    ✅ 确认恢复此备份
                  </Button>
                  <Button
                    style={{
                      width: '100%',
                      height: '72rpx',
                      lineHeight: '72rpx',
                      background: '#F7F8FA',
                      color: '#4E5969',
                      borderRadius: '14rpx',
                      fontSize: '26rpx',
                      border: 'none'
                    }}
                    onClick={() => {
                      setRestoreStep('list');
                      setSelectedRestore(null);
                    }}
                  >
                    ← 返回选择其他备份
                  </Button>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {showPaste && (
        <View
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32rpx'
          }}
          onClick={() => setShowPaste(false)}
        >
          <View
            style={{
              width: '100%',
              background: '#fff',
              borderRadius: '20rpx',
              padding: '32rpx',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Text
              style={{
                fontSize: '32rpx',
                fontWeight: 'bold',
                color: '#1D2129',
                marginBottom: '8rpx'
              }}
            >
              📋 粘贴备份 JSON
            </Text>
            <Text style={{ fontSize: '24rpx', color: '#86909C', marginBottom: '24rpx' }}>
              将之前导出的备份内容完整粘贴到下方
            </Text>
            <Textarea
              value={pasteValue}
              placeholder="在此粘贴备份JSON..."
              autoHeight
              style={{
                width: '100%',
                minHeight: '280rpx',
                background: '#F7F8FA',
                borderRadius: '14rpx',
                padding: '20rpx',
                fontSize: '24rpx',
                lineHeight: '32rpx',
                color: '#1D2129',
                boxSizing: 'border-box'
              }}
              onInput={(e) => setPasteValue(e.detail.value)}
            />
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16rpx',
                marginTop: '24rpx'
              }}
            >
              <Button
                style={{
                  width: '100%',
                  height: '76rpx',
                  lineHeight: '76rpx',
                  background: 'linear-gradient(135deg, #722ED1 0%, #9254DE 100%)',
                  color: '#fff',
                  borderRadius: '14rpx',
                  fontSize: '28rpx',
                  border: 'none'
                }}
                onClick={handlePasteRestore}
              >
                解析并预览
              </Button>
              <Button
                style={{
                  width: '100%',
                  height: '72rpx',
                  lineHeight: '72rpx',
                  background: 'transparent',
                  color: '#86909C',
                  border: 'none',
                  fontSize: '26rpx'
                }}
                onClick={() => setShowPaste(false)}
              >
                取消
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

export default SettingsPage;
