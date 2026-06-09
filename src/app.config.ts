export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/diary/index',
    'pages/album/index',
    'pages/anniversary/index',
    'pages/mine/index',
    'pages/wishlist/index',
    'pages/mailbox/index',
    'pages/settings/index',
    'pages/diary-edit/index',
    'pages/diary-detail/index',
    'pages/album-detail/index',
    'pages/anniversary-edit/index',
    'pages/wish-edit/index',
    'pages/letter-write/index',
    'pages/activity/index',
    'pages/time-capsule/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF6B9D',
    navigationBarTitleText: '甜蜜空间',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF5F7'
  },
  tabBar: {
    color: '#A89BA9',
    selectedColor: '#FF6B9D',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/diary/index',
        text: '日记'
      },
      {
        pagePath: 'pages/album/index',
        text: '相册'
      },
      {
        pagePath: 'pages/anniversary/index',
        text: '纪念日'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
