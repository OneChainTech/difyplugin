const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function createTestUser() {
  const db = await open({
    filename: './fishing_app.db',
    driver: sqlite3.Database
  });

  // 创建测试用户
  const testUser = {
    id: 'test_user_001',
    name: '测试钓友',
    latitude: 39.9277, // 接近当前用户位置
    longitude: 116.4620,
    last_seen: new Date().toISOString(),
    is_online: 1
  };

  try {
    // 插入测试用户
    await db.run(
      'INSERT OR REPLACE INTO users (id, name, latitude, longitude, last_seen, is_online) VALUES (?, ?, ?, ?, ?, ?)',
      [testUser.id, testUser.name, testUser.latitude, testUser.longitude, testUser.last_seen, testUser.is_online]
    );

    // 为测试用户创建一些钓点
    const testSpots = [
      {
        user_id: testUser.id,
        latitude: 39.9278,
        longitude: 116.4621,
        fish_type: '鲫鱼',
        bait: '蚯蚓',
        environment: '城市河流',
        rod: '3.6米手竿'
      },
      {
        user_id: testUser.id,
        latitude: 39.9276,
        longitude: 116.4619,
        fish_type: '鲤鱼',
        bait: '玉米',
        environment: '城市河流',
        rod: '4.5米手竿'
      }
    ];

    for (const spot of testSpots) {
      await db.run(
        'INSERT INTO fishing_spots (user_id, latitude, longitude, fish_type, bait, environment, rod) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [spot.user_id, spot.latitude, spot.longitude, spot.fish_type, spot.bait, spot.environment, spot.rod]
      );
    }

    console.log('✅ 测试用户创建成功！');
    console.log('用户ID:', testUser.id);
    console.log('用户名:', testUser.name);
    console.log('位置:', testUser.latitude, testUser.longitude);
    console.log('钓点数量:', testSpots.length);

  } catch (error) {
    console.error('❌ 创建测试用户失败:', error);
  } finally {
    await db.close();
  }
}

createTestUser(); 