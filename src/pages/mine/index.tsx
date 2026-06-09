import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { calculateDaysTogether } from '@/utils';

function MinePage() {
  const couple = useAppStore((state) => state.couple);
  const currentUser = useAppStore((state) => state.currentUser);
  const diaries = useAppStore((state) => state.diaries);
  const photos = useAppStore((state) => state.photos);
  const wishes = useAppStore((state) => state.wishes);
  const letters = useAppStore((state) => state.letters);
  const anniversaries = useAppStore((state) => state.anniversaries);

  useDidShow(() => {
    console.log('[MinePage] Page did show');
  });

  const unreadLetters = useMemo(
    () => letters.filter((l) => l.toUserId === currentUser.id && !l.isRead && l.isSent).length,
    [letters, currentUser.id]
  );

  const pendingWishes = useMemo(() => wishes.filter((w) => w.status !== 'completed').length, [wishes]);

  const daysTogether = calculateDaysTogether(couple.anniversary);

  const completedYears = Math.floor(daysTogether / 365);
  const completedMonths = Math.floor((daysTogether % 365) / 30);

  const handleNavigate = (url: string) => {
    Taro.navigateTo({ url });
  };

  const handleSeal = () => {
    Taro.showModal({
      title: '确认封存？',
      content: '封存后所有数据将被加密保存，仅输入解封密码可查看。这是一个不可轻易撤销的操作。',
      confirmText: '确认封存',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '空间已封存 🔒', icon: 'none' });
        }
      }
    });
  };

  const otherUser = currentUser.id === couple.user1.id ? couple.user2 : couple.user1;

  const quickLinks = [
    { icon: '🌟', label: '愿望清单', path: '/pages/wishlist/index', badge: pendingWishes },
    { icon: '💌', label: '悄悄话', path: '/pages/mailbox/index', badge: unreadLetters },
    { icon: '⚙️', label: '设置', path: '/pages/settings/index' }
  ];

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.profileHeader}>
        <View className={styles.profileTop}>
          <Image
            src={currentUser.avatar}
            className={styles.profileAvatar}
            mode="aspectFill"
          />
          <View className={styles.profileInfo}>
            <Text className={styles.profileName}>{currentUser.name}</Text>
            <Text className={styles.profileDesc}>💞 被 {otherUser.name} 宠着的小可爱</Text>
          </View>
        </View>
      </View>

      <View className={styles.coupleCard}>
        <View className={styles.coupleInfo}>
          <View className={styles.couplePerson}>
            <Image
              src={couple.user1.avatar}
              className={styles.coupleAvatarSmall}
              mode="aspectFill"
            />
            <Text className={styles.coupleName}>{couple.user1.name}</Text>
          </View>
          <Text className={styles.coupleHeart}>💞</Text>
          <View className={styles.couplePerson} style={{ justifyContent: 'flex-end' }}>
            <Text className={styles.coupleName}>{couple.user2.name}</Text>
            <Image
              src={couple.user2.avatar}
              className={styles.coupleAvatarSmall}
              mode="aspectFill"
            />
          </View>
        </View>
        <View className={styles.coupleStats}>
          <View className={styles.coupleStat}>
            <Text className={styles.coupleStatNum}>{completedYears}</Text>
            <Text className={styles.coupleStatLabel}>年</Text>
          </View>
          <View className={styles.coupleStat}>
            <Text className={styles.coupleStatNum}>{completedMonths}</Text>
            <Text className={styles.coupleStatLabel}>月</Text>
          </View>
          <View className={styles.coupleStat}>
            <Text className={styles.coupleStatNum}>{daysTogether}</Text>
            <Text className={styles.coupleStatLabel}>总天数</Text>
          </View>
        </View>
      </View>

      <View className={styles.quickLinks}>
        {quickLinks.map((link) => (
          <View
            key={link.label}
            className={styles.quickLink}
            style={{ position: 'relative' }}
            onClick={() => handleNavigate(link.path)}
          >
            {link.badge && link.badge > 0 && (
              <View className={styles.quickLinkBadge}>{link.badge}</View>
            )}
            <Text className={styles.quickLinkIcon}>{link.icon}</Text>
            <Text className={styles.quickLinkLabel}>{link.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuGroup}>
          <View
            className={styles.menuItem}
            onClick={() => handleNavigate('/pages/diary/index')}
          >
            <View className={styles.menuIcon}>📝</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>我的日记</Text>
              <Text className={styles.menuDesc}>记录我们的点点滴滴</Text>
            </View>
            <Text className={styles.menuValue}>{diaries.length}篇</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => handleNavigate('/pages/album/index')}
          >
            <View className={styles.menuIcon}>📷</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>我的相册</Text>
              <Text className={styles.menuDesc}>珍藏每一个美好瞬间</Text>
            </View>
            <Text className={styles.menuValue}>{photos.length}张</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => handleNavigate('/pages/anniversary/index')}
          >
            <View className={styles.menuIcon}>🎂</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>纪念日管理</Text>
              <Text className={styles.menuDesc}>重要日子不容错过</Text>
            </View>
            <Text className={styles.menuValue}>{anniversaries.length}个</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        <View className={styles.menuGroup}>
          <View
            className={styles.menuItem}
            onClick={() => handleNavigate('/pages/settings/index')}
          >
            <View className={styles.menuIcon}>🔐</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>隐私与安全</Text>
              <Text className={styles.menuDesc}>访问密码、数据备份</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => handleNavigate('/pages/settings/index')}
          >
            <View className={styles.menuIcon}>💾</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>数据管理</Text>
              <Text className={styles.menuDesc}>导出备份、恢复数据</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => handleNavigate('/pages/settings/index')}
          >
            <View className={styles.menuIcon}>👩‍❤️‍👨</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>情侣资料</Text>
              <Text className={styles.menuDesc}>头像、昵称、恋爱故事</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.logoutSection}>
        <Button className={styles.sealBtn} onClick={handleSeal}>
          🔒 分手封存空间
        </Button>
      </View>
    </ScrollView>
  );
}

export default MinePage;
