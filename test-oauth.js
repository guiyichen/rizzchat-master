// 测试 OAuth 配置
const https = require('https');

async function testGoogleOAuth() {
  try {
    console.log('🔍 测试 Google OAuth 配置...');
    
    // 测试 Google OAuth discovery endpoint
    const discoveryUrl = 'https://accounts.google.com/.well-known/openid_configuration';
    
    console.log(`📡 请求: ${discoveryUrl}`);
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(discoveryUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
    
    console.log(`✅ 状态码: ${response.status}`);
    
    if (response.status === 200) {
      const config = JSON.parse(response.data);
      console.log('✅ Google OAuth 配置获取成功');
      console.log(`📋 授权端点: ${config.authorization_endpoint}`);
      console.log(`📋 令牌端点: ${config.token_endpoint}`);
      console.log(`📋 用户信息端点: ${config.userinfo_endpoint}`);
    } else {
      console.log('❌ Google OAuth 配置获取失败');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testGoogleOAuth();
