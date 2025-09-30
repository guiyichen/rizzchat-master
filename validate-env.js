// 环境变量验证脚本
const crypto = require('crypto');

function validateEnvironment() {
  console.log('🔍 验证环境变量配置...\n');
  
  const errors = [];
  const warnings = [];
  
  // 必需的环境变量
  const requiredVars = {
    'NEXTAUTH_URL': {
      required: true,
      validate: (value) => {
        if (!value) return 'NEXTAUTH_URL 未设置';
        if (!value.startsWith('https://')) {
          return '生产环境必须使用 HTTPS';
        }
        if (value.includes('localhost')) {
          return '生产环境不能使用 localhost';
        }
        return null;
      }
    },
    'NEXTAUTH_SECRET': {
      required: true,
      validate: (value) => {
        if (!value) return 'NEXTAUTH_SECRET 未设置';
        if (value.length < 32) {
          return 'NEXTAUTH_SECRET 长度不足32位';
        }
        return null;
      }
    },
    'GOOGLE_CLIENT_ID': {
      required: true,
      validate: (value) => {
        if (!value) return 'GOOGLE_CLIENT_ID 未设置';
        if (!value.includes('googleusercontent.com')) {
          return 'GOOGLE_CLIENT_ID 格式不正确';
        }
        return null;
      }
    },
    'GOOGLE_CLIENT_SECRET': {
      required: true,
      validate: (value) => {
        if (!value) return 'GOOGLE_CLIENT_SECRET 未设置';
        if (value.length < 20) {
          return 'GOOGLE_CLIENT_SECRET 长度不足';
        }
        return null;
      }
    },
    'DATABASE_URL': {
      required: true,
      validate: (value) => {
        if (!value) return 'DATABASE_URL 未设置';
        if (!value.startsWith('postgresql://')) {
          return 'DATABASE_URL 必须是 PostgreSQL 连接字符串';
        }
        return null;
      }
    }
  };
  
  // 检查必需变量
  Object.entries(requiredVars).forEach(([key, config]) => {
    const value = process.env[key];
    const error = config.validate(value);
    if (error) {
      errors.push(`${key}: ${error}`);
    } else {
      console.log(`✅ ${key}: 配置正确`);
    }
  });
  
  // 检查可选变量
  if (!process.env.NODE_ENV) {
    warnings.push('NODE_ENV 未设置，建议设置为 production');
  } else if (process.env.NODE_ENV !== 'production') {
    warnings.push(`NODE_ENV 设置为 ${process.env.NODE_ENV}，生产环境应设置为 production`);
  }
  
  // 生成建议的回调URL
  if (process.env.NEXTAUTH_URL) {
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`;
    console.log(`\n🔗 建议的Google Console回调URL: ${callbackUrl}`);
  }
  
  // 输出结果
  console.log('\n📊 验证结果:');
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ 所有配置都正确！');
  } else {
    if (errors.length > 0) {
      console.log('\n❌ 错误:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    if (warnings.length > 0) {
      console.log('\n⚠️  警告:');
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }
  }
  
  // 生成新的NEXTAUTH_SECRET（如果需要）
  if (errors.some(e => e.includes('NEXTAUTH_SECRET'))) {
    console.log('\n🔑 生成新的NEXTAUTH_SECRET:');
    const newSecret = crypto.randomBytes(32).toString('base64');
    console.log(`NEXTAUTH_SECRET=${newSecret}`);
  }
  
  return errors.length === 0;
}

// 运行验证
const isValid = validateEnvironment();
process.exit(isValid ? 0 : 1);
