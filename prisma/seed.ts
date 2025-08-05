import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@afore.com' },
    update: {},
    create: {
      email: 'admin@afore.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  })

  console.log('👤 Created admin user:', adminUser.email)

  // Create sample categories
  const category1 = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: '电子产品',
      slug: 'electronics',
      description: '各类电子产品',
      sortOrder: 1,
      isActive: true,
    },
  })

  const category2 = await prisma.category.upsert({
    where: { slug: 'furniture' },
    update: {},
    create: {
      name: '家具',
      slug: 'furniture',
      description: '家具用品',
      sortOrder: 2,
      isActive: true,
    },
  })

  // Create subcategories
  const subcategory1 = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: {
      name: '智能手机',
      slug: 'smartphones',
      description: '各品牌智能手机',
      parentId: category1.id,
      sortOrder: 1,
      isActive: true,
    },
  })

  const subcategory2 = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      name: '笔记本电脑',
      slug: 'laptops',
      description: '各品牌笔记本电脑',
      parentId: category1.id,
      sortOrder: 2,
      isActive: true,
    },
  })

  console.log('📂 Created categories and subcategories')

  // Create sample products
  const product1 = await prisma.product.upsert({
    where: { slug: 'iphone-15-pro' },
    update: {},
    create: {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Apple iPhone 15 Pro 智能手机，配备先进的A17 Pro芯片和专业级相机系统。',
      price: 8999.00,
      specifications: JSON.stringify({
        screen: '6.1英寸超视网膜XDR显示屏',
        processor: 'A17 Pro芯片',
        storage: '128GB/256GB/512GB/1TB',
        camera: '主摄：4800万像素，超广角：1200万像素，长焦：1200万像素',
        battery: '视频播放最长可达23小时',
      }),
      metaTitle: 'iPhone 15 Pro - 专业级智能手机',
      metaDescription: 'Apple iPhone 15 Pro，搭载A17 Pro芯片，专业相机系统，钛金属设计。',
      metaKeywords: 'iPhone, Apple, 智能手机, A17 Pro, 专业相机',
      categoryId: subcategory1.id,
      sortOrder: 1,
      isActive: true,
    },
  })

  const product2 = await prisma.product.upsert({
    where: { slug: 'macbook-pro-14' },
    update: {},
    create: {
      name: 'MacBook Pro 14英寸',
      slug: 'macbook-pro-14',
      description: 'Apple MacBook Pro 14英寸笔记本电脑，搭载M3芯片，专业性能。',
      price: 14999.00,
      specifications: JSON.stringify({
        screen: '14.2英寸Liquid Retina XDR显示屏',
        processor: 'Apple M3芯片',
        memory: '8GB/16GB/32GB统一内存',
        storage: '512GB/1TB/2TB/4TB/8TB SSD',
        battery: '视频播放最长可达18小时',
      }),
      metaTitle: 'MacBook Pro 14英寸 - 专业笔记本电脑',
      metaDescription: 'Apple MacBook Pro 14英寸，M3芯片，专业性能，适合创意工作者。',
      metaKeywords: 'MacBook Pro, Apple, 笔记本, M3芯片, 专业',
      categoryId: subcategory2.id,
      sortOrder: 1,
      isActive: true,
    },
  })

  console.log('📦 Created sample products')

  // Create sample pages
  const aboutPage = await prisma.page.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      title: '关于我们',
      slug: 'about',
      content: `
        <h2>公司简介</h2>
        <p>我们是一家专业的产品展示公司，致力于为客户提供优质的产品和服务。</p>
        
        <h3>我们的使命</h3>
        <p>通过创新的产品和卓越的服务，为客户创造价值。</p>
        
        <h3>我们的愿景</h3>
        <p>成为行业领先的产品服务提供商。</p>
      `,
      metaTitle: '关于我们 - 专业产品服务提供商',
      metaDescription: '了解我们公司的使命、愿景和价值观，我们致力于提供优质的产品和服务。',
      isActive: true,
    },
  })

  const contactPage = await prisma.page.upsert({
    where: { slug: 'contact' },
    update: {},
    create: {
      title: '联系我们',
      slug: 'contact',
      content: `
        <h2>联系方式</h2>
        
        <h3>公司地址</h3>
        <p>北京市朝阳区xxx街道xxx号</p>
        
        <h3>联系电话</h3>
        <p>400-123-4567</p>
        
        <h3>邮箱地址</h3>
        <p>contact@afore.com</p>
        
        <h3>工作时间</h3>
        <p>周一至周五：9:00 - 18:00</p>
      `,
      metaTitle: '联系我们 - 获取专业服务支持',
      metaDescription: '联系我们获取专业的产品服务支持，我们随时为您提供帮助。',
      isActive: true,
    },
  })

  console.log('📄 Created sample pages')

  console.log('✅ Database seed completed!')
  console.log('📧 Admin login: admin@afore.com / admin123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })