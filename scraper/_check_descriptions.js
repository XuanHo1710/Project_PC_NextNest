const { MongoClient } = require('mongodb');

(async () => {
    const client = new MongoClient(process.env.MONGODB_URI || '');
    await client.connect();
    const db = client.db();

    // Get description stats
    const results = await db.collection('products').aggregate([
        { $match: { isDeleted: false, status: 'ACTIVE' } },
        {
            $project: {
                name: 1,
                slug: 1,
                descLen: { $strLenCP: { $ifNull: ['$description', ''] } },
                descStart: { $substrCP: [{ $ifNull: ['$description', ''] }, 0, 150] }
            }
        },
        { $sort: { descLen: -1 } },
        { $limit: 20 }
    ]).toArray();

    console.log('=== Top 20 products by description size ===');
    results.forEach(p => {
        console.log(`${p.name?.substring(0, 50).padEnd(50)} | ${(p.descLen / 1024).toFixed(0).padStart(5)}KB | ${p.descStart?.substring(0, 80).replace(/\n/g, ' ')}`);
    });

    // Stats
    const stats = await db.collection('products').aggregate([
        { $match: { isDeleted: false, status: 'ACTIVE' } },
        { $project: { descLen: { $strLenCP: { $ifNull: ['$description', ''] } } } },
        {
            $group: {
                _id: null,
                avgLen: { $avg: '$descLen' },
                maxLen: { $max: '$descLen' },
                minLen: { $min: '$descLen' },
                totalProducts: { $sum: 1 },
                bigDescs: { $sum: { $cond: [{ $gt: ['$descLen', 50000] }, 1, 0] } },
                hugeDescs: { $sum: { $cond: [{ $gt: ['$descLen', 200000] }, 1, 0] } },
                emptyDescs: { $sum: { $cond: [{ $lte: ['$descLen', 10] }, 1, 0] } },
            }
        }
    ]).toArray();

    console.log('\n=== Description Stats ===');
    const s = stats[0];
    console.log(`Total products: ${s.totalProducts}`);
    console.log(`Avg desc size: ${(s.avgLen / 1024).toFixed(1)}KB`);
    console.log(`Max desc size: ${(s.maxLen / 1024).toFixed(1)}KB`);
    console.log(`Min desc size: ${(s.minLen / 1024).toFixed(1)}KB`);
    console.log(`Descs > 50KB: ${s.bigDescs}`);
    console.log(`Descs > 200KB: ${s.hugeDescs}`);
    console.log(`Empty descs: ${s.emptyDescs}`);

    // Check what patterns are in descriptions (CellphoneS, payment, GTM, etc.)
    const patterns = await db.collection('products').aggregate([
        { $match: { isDeleted: false, status: 'ACTIVE', description: { $exists: true, $ne: '' } } },
        {
            $project: {
                hasCellphones: { $regexMatch: { input: '$description', regex: /cellphones\.com/i } },
                hasGTM: { $regexMatch: { input: '$description', regex: /googletagmanager/i } },
                hasScript: { $regexMatch: { input: '$description', regex: /<script/i } },
                hasNuxt: { $regexMatch: { input: '$description', regex: /__nuxt|__layout/i } },
                hasPayment: { $regexMatch: { input: '$description', regex: /PhÆ°Æ¡ng thá»©c thanh toÃ¡n|VNPAY|momo|ZaloPay/i } },
                hasIframe: { $regexMatch: { input: '$description', regex: /<iframe/i } },
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                cellphones: { $sum: { $cond: ['$hasCellphones', 1, 0] } },
                gtm: { $sum: { $cond: ['$hasGTM', 1, 0] } },
                script: { $sum: { $cond: ['$hasScript', 1, 0] } },
                nuxt: { $sum: { $cond: ['$hasNuxt', 1, 0] } },
                payment: { $sum: { $cond: ['$hasPayment', 1, 0] } },
                iframe: { $sum: { $cond: ['$hasIframe', 1, 0] } },
            }
        }
    ]).toArray();

    console.log('\n=== Junk content patterns ===');
    const p = patterns[0];
    console.log(`Total with description: ${p.total}`);
    console.log(`Contains cellphones.com: ${p.cellphones}`);
    console.log(`Contains GTM scripts: ${p.gtm}`);
    console.log(`Contains <script> tags: ${p.script}`);
    console.log(`Contains __nuxt/__layout: ${p.nuxt}`);
    console.log(`Contains payment methods: ${p.payment}`);
    console.log(`Contains <iframe>: ${p.iframe}`);

    await client.close();
    process.exit(0);
})();
