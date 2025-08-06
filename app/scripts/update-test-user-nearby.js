const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function updateTestUserNearby() {
  const db = await open({
    filename: path.join(__dirname, '../fishing_app.db'),
    driver: sqlite3.Database
  });

  // 当前用户位置
  const currentLat = 39.9264424617052;
  const currentLng = 116.455885604836;
  
  // 在500米范围内生成一个随机位置（约0.004度）
  const offsetLat = (Math.random() - 0.5) * 0.004;
  const offsetLng = (Math.random() - 0.5) * 0.004;
  
  const newLat = currentLat + offsetLat;
  const newLng = currentLng + offsetLng;

  console.log('Updating test user location...');
  console.log('Current user:', currentLat, currentLng);
  console.log('New test user location:', newLat, newLng);

  // 更新测试用户位置
  await db.run(
    'UPDATE users SET latitude = ?, longitude = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?',
    [newLat, newLng, 'test_user_001']
  );

  // 更新测试用户的钓点位置
  await db.run(
    'UPDATE fishing_spots SET latitude = ?, longitude = ? WHERE user_id = ?',
    [newLat, newLng, 'test_user_001']
  );

  console.log('Test user location updated successfully!');
  
  // 计算距离
  const distance = Math.sqrt(
    Math.pow(newLat - currentLat, 2) + 
    Math.pow(newLng - currentLng, 2)
  ) * 111000;
  console.log('Distance from current user:', distance.toFixed(2), 'meters');

  await db.close();
}

updateTestUserNearby().catch(console.error); 