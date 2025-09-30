// 测试 Gmail 登录和用户信息获取
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testUserInfo() {
  try {
    console.log('🔍 查询所有用户信息...')
    
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
        subscription: true
      }
    })
    
    console.log(`📊 找到 ${users.length} 个用户:`)
    
    users.forEach((user, index) => {
      console.log(`\n👤 用户 ${index + 1}:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   姓名: ${user.name || '未设置'}`)
      console.log(`   邮箱: ${user.email || '未设置'}`)
      console.log(`   头像: ${user.image || '未设置'}`)
      console.log(`   邮箱验证: ${user.emailVerified || '未验证'}`)
      console.log(`   使用次数: ${user.usageCount}`)
      console.log(`   最后使用: ${user.lastUsed || '从未使用'}`)
      console.log(`   账户数量: ${user.accounts.length}`)
      console.log(`   会话数量: ${user.sessions.length}`)
      console.log(`   订阅状态: ${user.subscription?.status || '无订阅'}`)
    })
    
    // 查询 Google 账户
    const googleAccounts = await prisma.account.findMany({
      where: {
        provider: 'google'
      },
      include: {
        user: true
      }
    })
    
    console.log(`\n🔗 Google 账户数量: ${googleAccounts.length}`)
    
    googleAccounts.forEach((account, index) => {
      console.log(`\n📧 Google 账户 ${index + 1}:`)
      console.log(`   用户ID: ${account.userId}`)
      console.log(`   用户姓名: ${account.user.name}`)
      console.log(`   用户邮箱: ${account.user.email}`)
      console.log(`   提供商ID: ${account.providerAccountId}`)
      console.log(`   访问令牌: ${account.access_token ? '已设置' : '未设置'}`)
      console.log(`   刷新令牌: ${account.refresh_token ? '已设置' : '未设置'}`)
    })
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行测试
testUserInfo()
