#!/usr/bin/env node

// Gmail登录功能完整测试脚本
const { PrismaClient } = require('@prisma/client');
const https = require('https');

const prisma = new PrismaClient();

console.log('🔐 Gmail登录功能完整测试\n');

async function runAllTests() {
  try {
    // 测试1：环境变量检查
    await testEnvironmentVariables();
    
    // 测试2：数据库连接
    await testDatabaseConnection();
    
    // 测试3：Google OAuth配置
    await testGoogleOAuthConfig();
    
    // 测试4：模拟登录功能
    await testMockLogin();
    
    // 测试5：数据库数据验证
    await testDatabaseData();
    
    // 测试6：API端点测试
    await testAPIEndpoints();
    
    console.log('\n✅ 所有测试完成！');
    
  } catch (error) {
    console.error('\n❌ 测试过程中出现错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function testEnvironmentVariables() {
  console.log('📋 测试1: 环境变量检查');
  console.log('=' .repeat(50));
  
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'DATABASE_URL'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      if (varName.includes('SECRET') || varName.includes('KEY')) {
        console.log(`✅ ${varName}: 已设置 (${value.length} 字符)`);
      } else {
        console.log(`✅ ${varName}: ${value}`);
      }
    } else {
      console.log(`❌ ${varName}: 未设置`);
      allPresent = false;
    }
  });
  
  if (allPresent) {
    console.log('✅ 所有必需的环境变量都已设置\n');
  } else {
    console.log('❌ 缺少必需的环境变量\n');
  }
}

async function testDatabaseConnection() {
  console.log('🗄️ 测试2: 数据库连接');
  console.log('=' .repeat(50));
  
  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 测试基本查询
    const userCount = await prisma.user.count();
    console.log(`✅ 数据库查询成功，当前用户数量: ${userCount}`);
    
    // 测试表结构
    const tables = ['User', 'Account', 'Session'];
    for (const table of tables) {
      try {
        await prisma[table.toLowerCase()].findFirst();
        console.log(`✅ ${table} 表可访问`);
      } catch (error) {
        console.log(`❌ ${table} 表访问失败: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ 数据库连接失败: ${error.message}`);
  }
  
  console.log('');
}

async function testGoogleOAuthConfig() {
  console.log('🔗 测试3: Google OAuth配置');
  console.log('=' .repeat(50));
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.log('❌ Google OAuth 凭据未设置');
    return;
  }
  
  // 检查Client ID格式
  if (clientId.includes('googleusercontent.com')) {
    console.log('✅ Google Client ID 格式正确');
  } else {
    console.log('❌ Google Client ID 格式可能不正确');
  }
  
  // 检查Client Secret长度
  if (clientSecret.length >= 20) {
    console.log('✅ Google Client Secret 长度合适');
  } else {
    console.log('❌ Google Client Secret 长度可能不足');
  }
  
  // 测试Google OAuth发现端点
  try {
    const discoveryUrl = 'https://accounts.google.com/.well-known/openid_configuration';
    console.log(`🔍 测试Google OAuth发现端点: ${discoveryUrl}`);
    
    await new Promise((resolve, reject) => {
      const req = https.get(discoveryUrl, { timeout: 5000 }, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Google OAuth发现端点可访问');
          resolve();
        } else {
          console.log(`❌ Google OAuth发现端点返回状态码: ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
      
      req.on('timeout', () => {
        req.destroy();
        console.log('❌ Google OAuth发现端点超时');
        reject(new Error('Request timeout'));
      });
      
      req.on('error', (error) => {
        console.log(`❌ Google OAuth发现端点访问失败: ${error.message}`);
        reject(error);
      });
    });
    
  } catch (error) {
    console.log(`⚠️ Google OAuth发现端点测试失败: ${error.message}`);
    console.log('💡 这可能是网络问题，但不影响本地测试');
  }
  
  console.log('');
}

async function testMockLogin() {
  console.log('🧪 测试4: 模拟登录功能');
  console.log('=' .repeat(50));
  
  try {
    // 创建测试用户数据
    const testUser = {
      name: '测试用户',
      email: `test_${Date.now()}@example.com`,
      image: 'https://via.placeholder.com/150'
    };
    
    console.log(`📝 创建测试用户: ${testUser.email}`);
    
    // 保存用户到数据库
    const user = await prisma.user.upsert({
      where: { email: testUser.email },
      update: {
        name: testUser.name,
        image: testUser.image,
        emailVerified: new Date(),
        lastUsed: new Date(),
      },
      create: {
        name: testUser.name,
        email: testUser.email,
        image: testUser.image,
        emailVerified: new Date(),
        lastUsed: new Date(),
        usageCount: 0,
      },
    });
    
    console.log(`✅ 用户创建成功，ID: ${user.id}`);
    
    // 创建模拟账户
    const account = await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: `test_${user.id}`,
        },
      },
      update: {
        userId: user.id,
        type: 'oauth',
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'Bearer',
        scope: 'openid email profile',
      },
      create: {
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: `test_${user.id}`,
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'Bearer',
        scope: 'openid email profile',
      },
    });
    
    console.log(`✅ 账户创建成功，ID: ${account.id}`);
    
    // 创建会话
    const session = await prisma.session.create({
      data: {
        sessionToken: `test_session_${Date.now()}`,
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天
      },
    });
    
    console.log(`✅ 会话创建成功，Token: ${session.sessionToken.substring(0, 20)}...`);
    
    // 清理测试数据
    await prisma.session.delete({ where: { id: session.id } });
    await prisma.account.delete({ where: { id: account.id } });
    await prisma.user.delete({ where: { id: user.id } });
    
    console.log('✅ 测试数据清理完成');
    
  } catch (error) {
    console.log(`❌ 模拟登录测试失败: ${error.message}`);
  }
  
  console.log('');
}

async function testDatabaseData() {
  console.log('📊 测试5: 数据库数据验证');
  console.log('=' .repeat(50));
  
  try {
    // 查询所有用户
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
      },
    });
    
    console.log(`📈 数据库统计:`);
    console.log(`   - 用户总数: ${users.length}`);
    
    const googleAccounts = await prisma.account.findMany({
      where: { provider: 'google' },
    });
    console.log(`   - Google账户数: ${googleAccounts.length}`);
    
    const activeSessions = await prisma.session.findMany({
      where: {
        expires: {
          gt: new Date(),
        },
      },
    });
    console.log(`   - 活跃会话数: ${activeSessions.length}`);
    
    if (users.length > 0) {
      console.log('\n👥 用户详情:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
        console.log(`      - 账户数: ${user.accounts.length}`);
        console.log(`      - 会话数: ${user.sessions.length}`);
        console.log(`      - 使用次数: ${user.usageCount}`);
        console.log(`      - 最后使用: ${user.lastUsed ? user.lastUsed.toLocaleString() : '从未使用'}`);
      });
    }
    
  } catch (error) {
    console.log(`❌ 数据库数据验证失败: ${error.message}`);
  }
  
  console.log('');
}

async function testAPIEndpoints() {
  console.log('🌐 测试6: API端点测试');
  console.log('=' .repeat(50));
  
  const baseUrl = 'http://localhost:3000';
  const endpoints = [
    '/api/auth/providers',
    '/api/auth/session',
    '/api/auth/csrf',
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`🔍 测试端点: ${endpoint}`);
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint} - 状态码: ${response.status}`);
        
        if (endpoint === '/api/auth/providers') {
          if (data.google) {
            console.log(`   - Google OAuth 已配置`);
          } else {
            console.log(`   - Google OAuth 未配置`);
          }
        }
      } else {
        console.log(`❌ ${endpoint} - 状态码: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint} - 错误: ${error.message}`);
    }
  }
  
  console.log('');
}

// 运行所有测试
runAllTests();
