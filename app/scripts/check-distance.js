const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function checkDistance() {
  const db = await open({
    filename: './fishing_app.db',
    driver: sqlite3.Database
  });

  // 当前用户位置（从日志中获取）
  const currentUserLocation = {
    latitude: 39.926355766585615,
    longitude: 116.4565028784527
  };

  // 测试用户位置
  const testUserLocation = {
    latitude: 39.9277,
    longitude: 116.4624
  };

  // 计算距离（米）
  const R = 6371000; // 地球半径（米）
  const dLat = (testUserLocation.latitude - currentUserLocation.latitude) * Math.PI / 180;
  const dLng = (testUserLocation.longitude - currentUserLocation.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(currentUserLocation.latitude * Math.PI / 180) * Math.cos(testUserLocation.latitude * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  console.log('当前用户位置:', currentUserLocation.latitude, currentUserLocation.longitude);
  console.log('测试用户位置:', testUserLocation.latitude, testUserLocation.longitude);
  console.log('距离:', distance.toFixed(2), '米');
  console.log('是否在50米内:', distance <= 50 ? '是' : '否');

  // 更新测试用户位置到更近的位置
  if (distance > 50) {
    const newLat = currentUserLocation.latitude + (Math.random() - 0.5) * 0.0005; // 约50米内
    const newLng = currentUserLocation.longitude + (Math.random() - 0.5) * 0.0005;
    
    await db.run(
      'UPDATE users SET latitude = ?, longitude = ? WHERE id = ?',
      [newLat, newLng, 'test_user_001']
    );
    
    console.log('已更新测试用户位置到:', newLat, newLng);
  }

  await db.close();
}

checkDistance(); 