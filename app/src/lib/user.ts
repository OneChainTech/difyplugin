import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  lastSeen: Date;
  isOnline: boolean;
}

// 生成基于机器信息的用户ID
export function generateUserId(): string {
  // 使用浏览器指纹信息生成用户ID
  const userAgent = navigator.userAgent;
  const screenInfo = `${screen.width}x${screen.height}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  
  // 创建唯一标识符
  const machineInfo = `${userAgent}|${screenInfo}|${timeZone}|${language}`;
  const hash = btoa(machineInfo).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  
  return `user_${hash}`;
}

// 获取或创建用户
export function getOrCreateUser(): User {
  const userId = localStorage.getItem('userId') || generateUserId();
  const userName = localStorage.getItem('userName') || `钓友${userId.slice(-4)}`;
  
  if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);
  }
  
  return {
    id: userId,
    name: userName,
    latitude: 0,
    longitude: 0,
    lastSeen: new Date(),
    isOnline: true
  };
}

// 更新用户位置
export function updateUserLocation(latitude: number, longitude: number): User {
  const user = getOrCreateUser();
  const updatedUser = {
    ...user,
    latitude,
    longitude,
    lastSeen: new Date()
  };
  
  localStorage.setItem('userLocation', JSON.stringify({
    latitude,
    longitude,
    lastSeen: updatedUser.lastSeen
  }));
  
  return updatedUser;
}

 