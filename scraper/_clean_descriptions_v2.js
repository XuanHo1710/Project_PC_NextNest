/**
 * Clean broken product descriptions in MongoDB.
 * - Strips entire scraped site chrome (navigation, headers, footers, payment methods)
 * - Removes <script>, <style>, <iframe>, <noscript>, <link>, <meta> tags
 * - Extracts only meaningful product content from CellphoneS/PCMarket pages
 * - Removes data-server-rendered __nuxt wrapper divs
 * - Caps description at 50KB max
 */
const { MongoClient } = require('mongodb');
const URI = process.env.MONGODB_URI || '';

// Patterns that indicate scraped site chrome (not actual product description)
const SITE_CHROME_PATTERNS = [
    'DANH Má»¤C Sáº¢N PHáº¨M',
    'Giá» hÃ ng',
    'ÄÄƒng nháº­p',
    'ÄÄƒng kÃ½',
    'PC Gaming, Streaming',
    'MÃY TÃNH CHÆ I GAME PCM',
    'PC Äáº¸P',
    'PC GAMING GIÃ Ráºº',
    'Theo Khoáº£ng GiÃ¡',
    'DÆ°á»›i 10 Triá»‡u',
    '10 Triá»‡u - 15 Triá»‡u',
    'ÄÄ‚NG KÃ NHáº¬N TIN KHUYáº¾N MÃƒI',
    'Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i cá»§a báº¡n',
    'Nháº­n ngay Voucher',
    'PhÆ°Æ¡ng thá»©c thanh toÃ¡n',
    'data-server-rendered="true"',
    'id="__nuxt"',
    'id="__layout"',
    'window.__NUXT__',
    'gtm.start',
    'googletagmanager.com',
    'google-analytics.com',
    'facebook.com/tr',
    'zalo.me/widget',
];

function cleanDescription(html) {
    if (!html || typeof html !== 'string') return '';

    let cleaned = html;

    // 1. Remove script tags and content
    cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');

    // 2. Remove style tags and content
    cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');

    // 3. Remove noscript, iframe, link, meta, object, embed
    cleaned = cleaned.replace(/<(noscript|iframe|link|meta|object|embed|form)[\s\S]*?(<\/\1>|\/?>)/gi, '');

    // 4. Remove HTML comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

    // 5. For CellphoneS pages wrapped in __nuxt, extract article content
    if (cleaned.includes('data-server-rendered') || cleaned.includes('__nuxt')) {
        // Try to extract just the article/main content
        const articleMatch = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
        if (articleMatch) {
            cleaned = articleMatch[1];
        } else {
            // Try to find the main content div
            const mainMatch = cleaned.match(/<div[^>]*class="[^"]*(?:product-detail|content|description|article)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>)?/i);
            if (mainMatch) {
                cleaned = mainMatch[1];
            }
        }
    }

    // 6. Remove navigation menus, headers, footers
    cleaned = cleaned.replace(/<nav[\s\S]*?<\/nav>/gi, '');
    cleaned = cleaned.replace(/<header[\s\S]*?<\/header>/gi, '');
    cleaned = cleaned.replace(/<footer[\s\S]*?<\/footer>/gi, '');

    // 7. Remove common CellphoneS/PCMarket site chrome sections
    // Remove divs containing payment methods
    cleaned = cleaned.replace(/<div[^>]*>[\s\S]*?PhÆ°Æ¡ng thá»©c thanh toÃ¡n[\s\S]*?<\/div>/gi, '');

    // 8. Remove inline event handlers and data attributes for security
    cleaned = cleaned.replace(/\s(on\w+|data-gtm|data-analytics|data-tracking)="[^"]*"/gi, '');

    // 9. Remove tracking pixels and invisible images
    cleaned = cleaned.replace(/<img[^>]*(?:tracking|pixel|facebook\.com\/tr|google-analytics|1x1|spacer)[^>]*\/?>/gi, '');

    // 10. Remove empty tags recursively (up to 3 passes)
    for (let i = 0; i < 3; i++) {
        cleaned = cleaned.replace(/<(\w+)[^>]*>\s*<\/\1>/g, '');
    }

    // 11. Collapse excessive whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    cleaned = cleaned.trim();

    // 12. Cap at 50KB
    if (cleaned.length > 50000) {
        // Find a good breakpoint
        const breakpoint = cleaned.lastIndexOf('</p>', 50000);
        if (breakpoint > 30000) {
            cleaned = cleaned.substring(0, breakpoint + 4);
        } else {
            cleaned = cleaned.substring(0, 50000);
        }
    }

    return cleaned;
}

function isBrokenDescription(html) {
    if (!html) return false;
    for (const pattern of SITE_CHROME_PATTERNS) {
        if (html.includes(pattern)) return true;
    }
    if (html.length > 200000) return true;
    return false;
}

async function main() {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(URI, { serverSelectionTimeoutMS: 30000 });
    await client.connect();
    console.log('Connected!');
    const db = client.db();
    const col = db.collection('products');

    // Process in batches using cursor
    const cursor = col.find(
        { description: { $exists: true, $ne: '' } },
        { projection: { _id: 1, slug: 1, description: 1, name: 1 } }
    ).batchSize(20);

    let total = 0, cleaned = 0, skipped = 0;
    const bulkOps = [];

    for await (const doc of cursor) {
        total++;
        const desc = doc.description || '';

        if (!isBrokenDescription(desc) && desc.length <= 50000) {
            skipped++;
            if (total % 100 === 0) console.log(`  Processed ${total}... (${cleaned} cleaned, ${skipped} ok)`);
            continue;
        }

        const cleanedDesc = cleanDescription(desc);
        const reduction = desc.length - cleanedDesc.length;

        if (reduction > 100) { // Only update if meaningful change
            bulkOps.push({
                updateOne: {
                    filter: { _id: doc._id },
                    update: { $set: { description: cleanedDesc } }
                }
            });
            cleaned++;

            if (reduction > 10000) {
                console.log(`  Cleaned: ${(doc.slug || '').substring(0, 50)} | ${desc.length} -> ${cleanedDesc.length} (saved ${Math.round(reduction / 1024)}KB)`);
            }
        }

        // Flush bulk ops every 50
        if (bulkOps.length >= 50) {
            await col.bulkWrite(bulkOps);
            bulkOps.length = 0;
            console.log(`  Flushed batch. Processed ${total}, cleaned ${cleaned}`);
        }
    }

    // Flush remaining
    if (bulkOps.length > 0) {
        await col.bulkWrite(bulkOps);
    }

    console.log('\n=== Summary ===');
    console.log(`Total processed: ${total}`);
    console.log(`Cleaned: ${cleaned}`);
    console.log(`Skipped (ok): ${skipped}`);

    await client.close();
    process.exit(0);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
