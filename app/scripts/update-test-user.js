const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function updateTestUser() {
  const db = await open({
    filename: './fishing_app.db',
    driver: sqlite3.Database
  });

  // 朝阳医院附近的坐标（大约在39.9280, 116.4620附近）
  const newLocation = {
    id: 'test_user_001',
    name: '测试钓友',
    latitude: 39.9280, // 朝阳医院附近
    longitude: 116.4620,
    last_seen: new Date().toISOString(),
    is_online: 1
  };

  try {
    // 更新测试用户位置
    await db.run(
      'UPDATE users SET latitude = ?, longitude = ?, last_seen = ? WHERE id = ?',
      [newLocation.latitude, newLocation.longitude, newLocation.last_seen, newLocation.id]
    );

    // 更新测试用户的钓点位置（稍微偏移一点）
    const testSpots = [
      {
        id: 1,
        latitude: 39.9281,
        longitude: 116.4621
      },
      {
        id: 2,
        latitude: 39.9279,
        longitude: 116.4619
      }
    ];

    for (const spot of testSpots) {
      await db.run(
        'UPDATE fishing_spots SET latitude = ?, longitude = ? WHERE id = ?',
        [spot.latitude, spot.longitude, spot.id]
      );
    }

    console.log('✅ 测试用户位置更新成功！');
    console.log('新位置:', newLocation.latitude, newLocation.longitude);
    console.log('钓点位置已更新');

  } catch (error) {
    console.error('❌ 更新测试用户位置失败:', error);
  } finally {
    await db.close();
  }
}

updateTestUser(); 