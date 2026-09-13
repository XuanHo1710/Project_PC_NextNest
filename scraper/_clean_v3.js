const { MongoClient } = require('mongodb');
const URI = process.env.MONGODB_URI || '';

async function main() {
    console.log('Connecting...');
    const c = new MongoClient(URI, { serverSelectionTimeoutMS: 30000 });
    await c.connect();
    console.log('Connected!');
    const db = c.db();
    const col = db.collection('products');

    // Count total with desc
    const total = await col.countDocuments({ description: { $exists: true, $ne: '' } });
    console.log('Total with description:', total);

    // Count large ones  
    const large = await col.countDocuments({ $expr: { $gt: [{ $strLenCP: '$description' }, 50000] } });
    console.log('Over 50KB:', large);

    // Process in small batches - only fetch _id and description length to find broken ones
    const cursor = col.find(
        { description: { $exists: true, $ne: '' } },
        { projection: { _id: 1, slug: 1, description: 1 } }
    ).batchSize(10);

    let processed = 0, cleaned = 0;
    const bulkOps = [];

    for await (const doc of cursor) {
        processed++;
        if (processed % 100 === 0) console.log(`  Processing ${processed}/${total}...`);

        const desc = doc.description || '';
        if (desc.length < 1000) continue; // Skip very short ones

        let needsClean = false;
        // Check for site chrome
        if (desc.includes('DANH Má»¤C Sáº¢N PHáº¨M') || desc.includes('PC Gaming, Streaming') ||
            desc.includes('Giá» hÃ ng') || desc.includes('data-server-rendered') ||
            desc.includes('__nuxt') || desc.includes('PhÆ°Æ¡ng thá»©c thanh toÃ¡n') ||
            desc.includes('ZaloPay') || desc.includes('VNPAY') ||
            desc.includes('ÄÄ‚NG KÃ NHáº¬N TIN') || desc.includes('Nháº­n ngay Voucher') ||
            desc.includes('Hotline mua hÃ ng') || desc.includes('Khiáº¿u náº¡i') ||
            desc.includes('googletagmanager') || desc.includes('facebook.com/tr') ||
            desc.length > 50000) {
            needsClean = true;
        }

        if (!needsClean) continue;

        let s = desc;
        // Remove script/style/noscript/iframe
        s = s.replace(/<(script|style|noscript|iframe|link|meta|object|embed|form)[\s\S]*?(<\/\1>|\/?>)/gi, '');
        // Remove HTML comments
        s = s.replace(/<!--[\s\S]*?-->/g, '');
        // Extract article from nuxt pages
        if (s.includes('data-server-rendered') || s.includes('__nuxt')) {
            const m = s.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
            if (m) s = m[1];
        }
        // Remove nav/header/footer
        s = s.replace(/<(nav|header|footer)[\s\S]*?<\/\1>/gi, '');
        // Remove payment method sections
        s = s.replace(/<div[^>]*>[\s\S]{0,500}?PhÆ°Æ¡ng thá»©c thanh toÃ¡n[\s\S]*?<\/div>/gi, '');
        // Remove site navigation sections  
        s = s.replace(/<div[^>]*>[\s\S]{0,200}?DANH Má»¤C Sáº¢N PHáº¨M[\s\S]*?<\/div>/gi, '');
        // Remove newsletter/promo sections
        s = s.replace(/<div[^>]*>[\s\S]{0,200}?ÄÄ‚NG KÃ NHáº¬N TIN[\s\S]*?<\/div>/gi, '');
        s = s.replace(/<div[^>]*>[\s\S]{0,200}?Nháº­n ngay Voucher[\s\S]*?<\/div>/gi, '');
        // Remove hotline/complaint sections
        s = s.replace(/<div[^>]*>[\s\S]{0,200}?Hotline mua hÃ ng[\s\S]*?<\/div>/gi, '');
        s = s.replace(/<div[^>]*>[\s\S]{0,200}?Khiáº¿u náº¡i[\s\S]*?<\/div>/gi, '');
        // Remove tracking imgs
        s = s.replace(/<img[^>]*(?:tracking|pixel|facebook\.com\/tr|google-analytics|1x1|spacer)[^>]*\/?>/gi, '');
        // Remove inline event handlers
        s = s.replace(/\s(on\w+)="[^"]*"/gi, '');
        // Remove empty tags (3 passes)
        for (let i = 0; i < 3; i++) s = s.replace(/<(\w+)[^>]*>\s*<\/\1>/g, '');
        // Collapse whitespace
        s = s.replace(/\n{3,}/g, '\n\n');
        s = s.trim();
        // Cap at 50KB
        if (s.length > 50000) {
            const bp = s.lastIndexOf('</p>', 50000);
            s = bp > 30000 ? s.substring(0, bp + 4) : s.substring(0, 50000);
        }

        const saved = desc.length - s.length;
        if (saved > 100) {
            bulkOps.push({
                updateOne: {
                    filter: { _id: doc._id },
                    update: { $set: { description: s } }
                }
            });
            cleaned++;
            if (saved > 10000) {
                console.log(`  Cleaned: ${(doc.slug || '').substring(0, 50)} | ${desc.length} -> ${s.length} (-${Math.round(saved / 1024)}KB)`);
            }
        }

        if (bulkOps.length >= 30) {
            await col.bulkWrite(bulkOps);
            bulkOps.length = 0;
        }
    }

    if (bulkOps.length > 0) await col.bulkWrite(bulkOps);

    console.log('\n=== Summary ===');
    console.log('Processed:', processed);
    console.log('Cleaned:', cleaned);

    await c.close();
    process.exit(0);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
