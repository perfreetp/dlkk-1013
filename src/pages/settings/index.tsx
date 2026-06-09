import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Switch, Button, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime } from '@/utils';

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
  const exportBackupData = useAppStore((state) => state.exportBackupData);

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
        <View className={styles.menuItem}>
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
    </ScrollView>
  );
}

export default SettingsPage;
