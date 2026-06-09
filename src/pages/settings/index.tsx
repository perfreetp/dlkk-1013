import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Switch, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';

function SettingsPage() {
  const couple = useAppStore((state) => state.couple);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const diaries = useAppStore((state) => state.diaries);
  const photos = useAppStore((state) => state.photos);

  useDidShow(() => {
    console.log('[SettingsPage] Page did show');
  });

  const [passwordEnabled, setPasswordEnabled] = useState(settings.isLocked);
  const [backupEnabled, setBackupEnabled] = useState(true);

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
    Taro.showLoading({ title: '正在导出...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showModal({
        title: '导出成功 ✅',
        content: `已导出：\n• ${diaries.length}篇日记\n• ${photos.length}张照片\n• ${couple.loveStory ? '1段恋爱故事' : ''}\n\n文件已保存至本地。`,
        showCancel: false,
        confirmText: '好的'
      });
    }, 1500);
  };

  const handleBackup = () => {
    Taro.showLoading({ title: '正在备份...' });
    setTimeout(() => {
      Taro.hideLoading();
      updateSettings({ lastBackupAt: new Date().toISOString() });
      Taro.showToast({ title: '备份完成 ☁️', icon: 'success' });
    }, 2000);
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
    </ScrollView>
  );
}

export default SettingsPage;
