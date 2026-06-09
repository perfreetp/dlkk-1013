import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export const formatDate = (date: string, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const formatRelativeTime = (date: string): string => {
  const now = dayjs();
  const target = dayjs(date);
  const diffDays = now.diff(target, 'day');
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
  return `${Math.floor(diffDays / 365)}年前`;
};

export const calculateDaysTogether = (startDate: string): number => {
  const start = dayjs(startDate);
  const now = dayjs();
  return now.diff(start, 'day') + 1;
};

export const calculateCountdown = (targetDate: string, repeat: 'none' | 'yearly' | 'monthly' = 'none'): { days: number; date: string } => {
  let target = dayjs(targetDate);
  const now = dayjs();

  if (repeat === 'yearly') {
    target = target.year(now.year());
    if (target.isBefore(now, 'day')) {
      target = target.add(1, 'year');
    }
  } else if (repeat === 'monthly') {
    target = target.month(now.month()).year(now.year());
    if (target.isBefore(now, 'day')) {
      target = target.add(1, 'month');
    }
  }

  const days = target.diff(now, 'day') + 1;
  return { days: Math.max(0, days), date: target.format('YYYY-MM-DD') };
};

export const generateBlessing = (type: string, names: string[]): string => {
  const blessings = {
    anniversary: [
      `愿${names[0]}和${names[1]}的爱情，如陈年美酒，越久越醇香`,
      `${names[0]}和${names[1]}，在一起的每一天都是最好的纪念日`,
      `年年岁岁，深情不减，愿你们携手到白头`
    ],
    birthday: [
      `生日快乐！愿你永远被爱包围，被温柔以待`,
      `新的一岁，愿你所愿皆所得，所行化坦途`,
      `愿你的每一天都像今天一样开心快乐`
    ],
    countdown: [
      `距离这美好的日子越来越近了，一起期待吧~`,
      `倒计时开始，每一天都充满期待`,
      `美好的事情值得等待，一起加油！`
    ]
  };

  const list = blessings[type as keyof typeof blessings] || blessings.anniversary;
  return list[Math.floor(Math.random() * list.length)];
};

export const getGreeting = (): string => {
  const hour = dayjs().hour();
  if (hour < 6) return '夜深了，早点休息哦';
  if (hour < 9) return '早上好，美好的一天开始啦';
  if (hour < 12) return '上午好呀，记得吃早餐';
  if (hour < 14) return '中午好，该吃午饭啦';
  if (hour < 18) return '下午好，喝杯下午茶吧';
  if (hour < 22) return '晚上好，今天过得怎么样';
  return '夜深了，早点休息哦';
};

export const validatePassword = (password: string): boolean => {
  return /^\d{4,6}$/.test(password);
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T => {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
};

export const throttle = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T => {
  let lastTime = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn(...args);
    }
  }) as T;
};
