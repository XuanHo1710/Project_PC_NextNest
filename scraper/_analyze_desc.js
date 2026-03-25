const { MongoClient } = require('mongodb');
const URI = 'mongodb+srv://xuanhodcbas:0984232310ho.@cluster0.f7sbfkn.mongodb.net/project-pc-hoang-ha';

async function main() {
    console.log('Connecting to MongoDB...');
    const c = new MongoClient(URI, { serverSelectionTimeoutMS: 30000 });
    await c.connect();
    console.log('Connected! Fetching products...');
    const db = c.db();

    // Fetch in batches to avoid memory issues
    const cursor = db.collection('products').find(
        { description: { $exists: true, $ne: '' } },
        { projection: { name: 1, description: 1, slug: 1 } }
    ).batchSize(50);

    let navCount = 0, paymentCount = 0, nuxtCount = 0, hugeCount = 0;
    let totalLen = 0, count = 0;
    const broken = [];

    for await (const p of cursor) {
        count++;
        const d = p.description || '';
        totalLen += d.length;
        const hasNav = d.includes('DANH MỤC SẢN PHẨM') || d.includes('PC Gaming, Streaming') || d.includes('Giỏ hàng');
        const hasPayment = d.includes('Phương thức thanh toán') || d.includes('ZaloPay') || d.includes('VNPAY');
        const hasNuxt = d.includes('__nuxt') || d.includes('data-server-rendered');
        const isHuge = d.length > 200000;

        if (hasNav) navCount++;
        if (hasPayment) paymentCount++;
        if (hasNuxt) nuxtCount++;
        if (isHuge) hugeCount++;

        if (hasNav || hasPayment || isHuge) {
            broken.push({ slug: (p.slug || '').substring(0, 60), len: d.length, hasNav, hasPayment, hasNuxt });
        }
    }

    console.log('Total products with desc:', count);
    console.log('Average desc length:', Math.round(totalLen / (count || 1)));
    console.log('With site navigation:', navCount);
    console.log('With payment methods:', paymentCount);
    console.log('With __nuxt:', nuxtCount);
    console.log('Over 200KB:', hugeCount);
    console.log('\nBroken examples (first 15):');
    broken.slice(0, 15).forEach(b => console.log(`  ${b.slug} | ${b.len} bytes | nav:${b.hasNav} pay:${b.hasPayment}`));

    await c.close();
    process.exit(0);
}
main().catch(e => { console.error('Error:', e.message); process.exit(1); });
