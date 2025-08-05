// 测试认证系统的简单脚本
// 使用方法: node scripts/test-auth.js

const BASE_URL = 'http://localhost:3001'

async function testAuth() {
    console.log('🔐 测试认证系统...\n')
    
    try {
        // 测试登录
        console.log('1. 测试登录 API...')
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@afore.com',
                password: 'admin123'
            })
        })
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json()
            console.log('✅ 登录成功:', loginData.user.name)
            
            // 获取cookie
            const cookies = loginResponse.headers.get('set-cookie')
            console.log('🍪 Cookie设置:', cookies ? '成功' : '失败')
            
        } else {
            const error = await loginResponse.json()
            console.log('❌ 登录失败:', error.error)
            return
        }
        
        // 测试获取用户信息
        console.log('\n2. 测试获取用户信息 API...')
        const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
            headers: {
                'Cookie': loginResponse.headers.get('set-cookie') || ''
            }
        })
        
        if (meResponse.ok) {
            const userData = await meResponse.json()
            console.log('✅ 获取用户信息成功:', userData.user.name)
        } else {
            console.log('❌ 获取用户信息失败')
        }
        
        // 测试退出登录
        console.log('\n3. 测试退出登录 API...')
        const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Cookie': loginResponse.headers.get('set-cookie') || ''
            }
        })
        
        if (logoutResponse.ok) {
            console.log('✅ 退出登录成功')
        } else {
            console.log('❌ 退出登录失败')
        }
        
        console.log('\n🎉 认证系统测试完成！')
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message)
        console.log('\n请确保：')
        console.log('1. 应用正在运行 (pnpm run dev)')
        console.log('2. 数据库已初始化 (pnpm run db:seed)')
        console.log('3. 默认管理员账号存在')
    }
}

testAuth()