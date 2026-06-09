import React, { useEffect, useState } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
// 全局样式
import './app.scss';

function App(props) {
  const settings = useAppStore((state) => state.settings);
  const hasVerifiedAccess = useAppStore((state) => state.hasVerifiedAccess);
  const setHasVerifiedAccess = useAppStore((state) => state.setHasVerifiedAccess);
  const processAllScheduledLetters = useAppStore((state) => state.processAllScheduledLetters);

  const [passwordInput, setPasswordInput] = useState('');
  const [shakeError, setShakeError] = useState(false);

  useEffect(() => {
    processAllScheduledLetters();
  }, [processAllScheduledLetters]);

  useDidShow(() => {
    processAllScheduledLetters();
  });

  useDidHide(() => {});

  const needVerify = settings.isLocked && !hasVerifiedAccess;

  const handleVerifyPassword = () => {
    const correctPwd = settings.accessPassword || '1234';
    if (passwordInput === correctPwd) {
      setHasVerifiedAccess(true);
      setPasswordInput('');
      setShakeError(false);
      Taro.showToast({ title: '验证通过', icon: 'success' });
    } else {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      Taro.showToast({ title: '密码错误', icon: 'error' });
    }
  };

  if (needVerify) {
    return (
      <View
        style={{
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #FF6B9D 0%, #FF85B1 50%, #FFA6C8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48rpx',
          boxSizing: 'border-box'
        }}
      >
        <View
          style={{
            width: '100%',
            background: '#fff',
            borderRadius: '32rpx',
            padding: '56rpx 40rpx',
            boxShadow: '0 12px 40px rgba(255, 107, 157, 0.3)',
            transform: shakeError ? 'translateX(-6rpx)' : 'none',
            transition: 'transform 0.08s ease'
          }}
        >
          <View style={{ textAlign: 'center' }}>
            <View style={{ fontSize: '96rpx', marginBottom: '20rpx' }}>🔐</View>
            <Text
              style={{
                display: 'block',
                fontSize: '40rpx',
                fontWeight: 'bold',
                color: '#FF6B9D',
                marginBottom: '12rpx'
              }}
            >
              甜蜜空间
            </Text>
            <Text
              style={{
                display: 'block',
                fontSize: '26rpx',
                color: '#86909C',
                marginBottom: '48rpx'
              }}
            >
              请输入访问密码继续
            </Text>
          </View>
          <Input
            type="password"
            password
            value={passwordInput}
            placeholder="请输入4-6位密码"
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
            onInput={(e) => setPasswordInput(e.detail.value)}
            onConfirm={handleVerifyPassword}
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
            onClick={handleVerifyPassword}
          >
            进入空间
          </Button>
          <Text
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: '24rpx',
              color: '#C9CDD4',
              marginTop: '28rpx'
            }}
          >
            💝 属于你们的专属空间
          </Text>
        </View>
      </View>
    );
  }

  return props.children;
}

export default App;
