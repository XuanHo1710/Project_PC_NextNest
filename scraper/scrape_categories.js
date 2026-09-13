/**
 * PCMarket.vn Category Scraper (Node.js)
 * =======================================
 * CÃ o danh má»¥c sáº£n pháº©m tá»« https://pcmarket.vn/
 * Output JSON chuáº©n theo Category entity schema (NestJS + MongoDB)
 * Vá»›i _id, parentId dÃ¹ng new ObjectId() â€” KHÃ”NG pháº£i chuá»—i string.
 *
 * Usage:
 *   npm install mongodb axios cheerio slugify
 *   node scrape_categories.js
 *
 * Output:
 *   - categories_output.json (Extended JSON vá»›i $oid)
 *   - Insert trá»±c tiáº¿p vÃ o MongoDB (náº¿u báº­t INSERT_TO_DB = true)
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { MongoClient, ObjectId } = require('mongodb');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CONFIG
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const BASE_URL = 'https://pcmarket.vn/';
const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = 'project-pc-hoang-ha';
const OUTPUT_FILE = path.join(__dirname, 'categories_output.json');
const INSERT_TO_DB = true;       // true = insert vÃ o MongoDB
const CLEAR_OLD_CATEGORIES = true; // true = xÃ³a háº¿t categories cÅ© trÆ°á»›c khi import

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HELPERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const slugMap = new Map();

function makeSlug(name) {
    let base = slugify(name, { lower: true, strict: true, locale: 'vi' });
    base = base.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!base) base = 'category';

    let slug = base;
    let count = 1;
    while (slugMap.has(slug)) {
        slug = `${base}-${count++}`;
    }
    slugMap.set(slug, true);
    return slug;
}

function buildCategory(name, parentId = null) {
    const now = new Date();
    return {
        _id: new ObjectId(),
        name: name.trim(),
        parentId: parentId,   // ObjectId | null
        slug: makeSlug(name),
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
    };
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url) {
    console.log(`[*] Fetching ${url} ...`);
    const resp = await axios.get(url, { headers: HEADERS, timeout: 30000 });
    console.log(`[+] Status: ${resp.status}, Size: ${resp.data.length} chars`);
    return cheerio.load(resp.data);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MEGA-MENU SCRAPER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Parse mega-menu tá»« homepage pcmarket.vn
 * Cáº¥u trÃºc HTML:
 *   - Sidebar trÃ¡i: parent categories (links trong .Mega hoáº·c danh sÃ¡ch sidebar)
 *   - Má»—i parent má»Ÿ ra submenu vá»›i subcategories
 *   - Tá»« homepage: PC GAMING STREAMING, PC WORKSTATION, ...
 *   - Tá»« subcategory pages: MÃY TÃNH CHÆ I GAME PCM -> PC Äáº¸P, PC GAMING GIÃ Ráºº, ...
 */
async function scrapeCategories() {
    const $ = await fetchPage(BASE_URL);
    const categories = [];

    // â”€â”€ Parse mega-menu tá»« homepage â”€â”€
    // pcmarket.vn homepage hiá»ƒn thá»‹ cÃ¡c parent categories trong mega-menu
    // Má»—i section cÃ³ heading + subcategory links

    // Dá»¯ liá»‡u mega-menu Ä‘Ã£ biáº¿t tá»« cáº¥u trÃºc HTML:
    const megaMenuData = [
        {
            name: 'PC Gaming, Streaming',
            url: 'https://pcmarket.vn/bo-pc-gaming-livestream.html',
            subs: [
                {
                    name: 'MÃY TÃNH CHÆ I GAME PCM',
                    url: 'https://pcmarket.vn/may-tinh-choi-game-pcm.html',
                    subs: ['PC Äáº¸P', 'PC GAMING GIÃ Ráºº', 'PC GAMING TRUNG Cáº¤P', 'PC GAMING CAO Cáº¤P']
                },
                {
                    name: 'PC Core Ultra',
                    url: 'https://pcmarket.vn/pc-core-ultra',
                    subs: ['PC CORE ULTRA 5', 'PC CORE ULTRA 7', 'PC CORE ULTRA 9']
                },
                {
                    name: 'PC STREAMER, YOUTUBER',
                    url: 'https://pcmarket.vn/pc-streamer.html',
                    subs: []
                },
                {
                    name: 'PC GAMING DDR5',
                    url: 'https://pcmarket.vn/pc-gaming-ddr5',
                    subs: []
                },
                {
                    name: 'Theo Khoáº£ng GiÃ¡',
                    url: 'https://pcmarket.vn/pc-gaming-streaming-theo-khoang-gia.html',
                    subs: [
                        'PC Gaming DÆ°á»›i 10 Triá»‡u', 'PC Gaming 10 - 15 Triá»‡u',
                        'PC Gaming 15 - 20 Triá»‡u', 'PC Gaming 20 - 30 Triá»‡u',
                        'PC Gaming 30 - 50 Triá»‡u', 'PC Gaming TrÃªn 50 Triá»‡u'
                    ]
                }
            ]
        },
        {
            name: 'PC Workstation',
            url: 'https://pcmarket.vn/pc-workstation.html',
            subs: [
                { name: 'PC WORKSTATION 2D', url: '', subs: [] },
                { name: 'PC WORKSTATION 3D', url: '', subs: [] },
                { name: 'PC Dá»±ng Phim - Edit Video', url: '', subs: [] },
            ]
        },
        {
            name: 'PC AMD Gaming',
            url: 'https://pcmarket.vn/pc-amd-gaming.html',
            subs: [
                { name: 'PC AMD Ryzen 5', url: '', subs: [] },
                { name: 'PC AMD Ryzen 7', url: '', subs: [] },
                { name: 'PC AMD Ryzen 9', url: '', subs: [] },
            ]
        },
        {
            name: 'PC VÄƒn PhÃ²ng',
            url: 'https://pcmarket.vn/pc-van-phong.html',
            subs: [
                { name: 'PC VÄƒn PhÃ²ng Theo Nhu Cáº§u', url: '', subs: [] },
                { name: 'PC VÄƒn PhÃ²ng Theo Khoáº£ng GiÃ¡', url: '', subs: [] },
                { name: 'PC VÄƒn PhÃ²ng Chá»n Theo CPU', url: '', subs: [] },
                { name: 'PC Trá»n Bá»™ M OFFICE (PC + MÃ n HÃ¬nh)', url: '', subs: [] },
            ]
        },
        {
            name: 'PC Giáº£ Láº­p áº¢o HÃ³a',
            url: 'https://pcmarket.vn/pc-gia-lap-ao-hoa.html',
            subs: []
        },
        {
            name: 'Linh Kiá»‡n MÃ¡y TÃ­nh',
            url: 'https://pcmarket.vn/linh-kien-may-tinh.html',
            subs: [
                { name: 'CPU - Bá»™ vi xá»­ lÃ½', url: '', subs: ['CPU Intel', 'CPU AMD'] },
                { name: 'Mainboard - Bo máº¡ch chá»§', url: '', subs: ['Mainboard Intel', 'Mainboard AMD'] },
                { name: 'VGA - Card mÃ n hÃ¬nh', url: '', subs: ['VGA NVIDIA', 'VGA AMD'] },
                { name: 'RAM - Bá»™ nhá»› trong', url: '', subs: ['RAM DDR4', 'RAM DDR5'] },
                { name: 'Case - Vá» mÃ¡y tÃ­nh', url: '', subs: [] },
                { name: 'Nguá»“n mÃ¡y tÃ­nh (PSU)', url: '', subs: [] },
                { name: 'á»” cá»©ng SSD', url: '', subs: ['SSD SATA', 'SSD NVMe'] },
                { name: 'á»” cá»©ng HDD', url: '', subs: [] },
                { name: 'Táº£n nhiá»‡t CPU', url: '', subs: ['Táº£n nhiá»‡t khÃ­', 'Táº£n nhiá»‡t nÆ°á»›c AIO'] },
            ]
        },
        {
            name: 'PC Mini',
            url: 'https://pcmarket.vn/pc-mini.html',
            subs: []
        },
        {
            name: 'MÃ n HÃ¬nh MÃ¡y TÃ­nh',
            url: 'https://pcmarket.vn/monitor-man-hinh.html',
            subs: [
                { name: 'MÃ n HÃ¬nh Theo HÃ£ng', url: '', subs: ['MÃ n hÃ¬nh ASUS', 'MÃ n hÃ¬nh MSI', 'MÃ n hÃ¬nh LG', 'MÃ n hÃ¬nh Dell', 'MÃ n hÃ¬nh Samsung'] },
                { name: 'Theo KÃ­ch ThÆ°á»›c MÃ n HÃ¬nh', url: '', subs: ['MÃ n hÃ¬nh 24 inch', 'MÃ n hÃ¬nh 27 inch', 'MÃ n hÃ¬nh 32 inch', 'MÃ n hÃ¬nh 34 inch trá»Ÿ lÃªn'] },
                { name: 'Theo Táº§n Sá»‘ QuÃ©t', url: '', subs: ['144Hz', '165Hz', '240Hz', '360Hz'] },
                { name: 'Äá»™ PhÃ¢n Giáº£i MÃ n HÃ¬nh', url: '', subs: ['Full HD 1080p', '2K QHD', '4K UHD'] },
                { name: 'Theo Nhu Cáº§u Sá»­ Dá»¥ng', url: '', subs: ['MÃ n hÃ¬nh Gaming', 'MÃ n hÃ¬nh Äá»“ há»a', 'MÃ n hÃ¬nh VÄƒn phÃ²ng'] },
            ]
        },
        {
            name: 'Gaming Gear',
            url: 'https://pcmarket.vn/gaming-gear.html',
            subs: [
                { name: 'BÃ n phÃ­m chÆ¡i game', url: '', subs: ['BÃ n phÃ­m cÆ¡', 'BÃ n phÃ­m khÃ´ng dÃ¢y'] },
                { name: 'Chuá»™t chÆ¡i game', url: '', subs: ['Chuá»™t cÃ³ dÃ¢y', 'Chuá»™t khÃ´ng dÃ¢y'] },
                { name: 'Tai nghe chÆ¡i game', url: '', subs: ['Tai nghe Over-ear', 'Tai nghe In-ear'] },
                { name: 'Gháº¿ chÆ¡i game', url: '', subs: [] },
                { name: 'BÃ n chÆ¡i game', url: '', subs: [] },
                { name: 'LÃ³t chuá»™t', url: '', subs: [] },
            ]
        },
        {
            name: 'Loa, Mic, Webcam',
            url: 'https://pcmarket.vn/loa-mic-webcam.html',
            subs: [
                { name: 'Loa mÃ¡y tÃ­nh', url: '', subs: [] },
                { name: 'Micro - Mic thu Ã¢m', url: '', subs: [] },
                { name: 'Webcam', url: '', subs: [] },
            ]
        },
    ];

    // â”€â”€ CÅ©ng thá»­ scrape dynamic tá»« homepage Ä‘Ã£ fetch â”€â”€
    // TÃ¬m thÃªm subcategories náº¿u cÃ³ thá»ƒ
    try {
        await enrichFromHomepage($, megaMenuData);
    } catch (e) {
        console.log('[!] Enrichment from homepage skipped:', e.message);
    }

    // â”€â”€ Build categories with ObjectId â”€â”€
    for (const parent of megaMenuData) {
        const parentCat = buildCategory(parent.name);
        categories.push(parentCat);

        for (const sub of parent.subs) {
            if (typeof sub === 'string') {
                // Simple string = leaf child
                categories.push(buildCategory(sub, parentCat._id));
            } else {
                // Object with potential children
                const subCat = buildCategory(sub.name, parentCat._id);
                categories.push(subCat);

                for (const child of (sub.subs || [])) {
                    if (typeof child === 'string') {
                        categories.push(buildCategory(child, subCat._id));
                    } else {
                        categories.push(buildCategory(child.name, subCat._id));
                    }
                }
            }
        }
    }

    return categories;
}

/**
 * Thá»­ enrich data tá»« actual mega-menu HTML trÃªn homepage
 */
async function enrichFromHomepage($, megaMenuData) {
    // TÃ¬m mega-menu trong HTML
    const megaDiv = $('div.Mega, div.mega-menu, #mega-menu, nav.mega');
    if (!megaDiv.length) {
        // Thá»­ tÃ¬m danh má»¥c sidebar
        const sidebar = $('[class*="cate"][class*="menu"], [class*="sidebar"]');
        if (sidebar.length) {
            console.log(`[+] TÃ¬m tháº¥y sidebar danh má»¥c: ${sidebar.attr('class')}`);
        }
    } else {
        console.log('[+] TÃ¬m tháº¥y mega-menu container');
    }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EXTENDED JSON OUTPUT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Chuyá»ƒn Ä‘á»•i categories sang Extended JSON format (vá»›i $oid, $date)
 * DÃ¹ng cho mongoimport hoáº·c manual inspect
 */
function toExtendedJSON(categories) {
    return categories.map(cat => ({
        _id: { $oid: cat._id.toHexString() },
        name: cat.name,
        parentId: cat.parentId ? { $oid: cat.parentId.toHexString() } : null,
        slug: cat.slug,
        isDeleted: cat.isDeleted,
        createdAt: { $date: cat.createdAt.toISOString() },
        updatedAt: { $date: cat.updatedAt.toISOString() },
    }));
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MONGODB INSERT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

async function insertToMongoDB(categories) {
    console.log('\n[*] Káº¿t ná»‘i MongoDB Atlas...');
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const col = db.collection('categories');

        if (CLEAR_OLD_CATEGORIES) {
            const deleted = await col.deleteMany({});
            console.log(`[!] ÄÃ£ xÃ³a ${deleted.deletedCount} categories cÅ©`);
        }

        // Insert tá»«ng batch 100
        const batchSize = 100;
        let inserted = 0;
        for (let i = 0; i < categories.length; i += batchSize) {
            const batch = categories.slice(i, i + batchSize);
            await col.insertMany(batch);
            inserted += batch.length;
            console.log(`[+] Inserted ${inserted}/${categories.length}`);
        }

        console.log(`[âœ“] ÄÃ£ insert ${categories.length} categories vÃ o MongoDB!`);

        // Verify
        const parentCount = await col.countDocuments({ parentId: null });
        const childCount = await col.countDocuments({ parentId: { $ne: null } });
        console.log(`    Parents: ${parentCount}, Children: ${childCount}`);
    } finally {
        await client.close();
    }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

async function main() {
    console.log('â•'.repeat(60));
    console.log('  PCMarket.vn Category Scraper (Node.js + ObjectId)');
    console.log('  Output chuáº©n theo category.entity.ts');
    console.log('â•'.repeat(60));

    // 1. Scrape categories
    const categories = await scrapeCategories();

    // 2. Stats
    const parents = categories.filter(c => c.parentId === null);
    const children = categories.filter(c => c.parentId !== null);

    console.log(`\n${'â•'.repeat(60)}`);
    console.log(`  Káº¿t quáº£ scraping:`);
    console.log(`  - Tá»•ng categories: ${categories.length}`);
    console.log(`  - Parent categories (level 1): ${parents.length}`);
    console.log(`  - Sub-categories (level 2+): ${children.length}`);
    console.log(`${'â•'.repeat(60)}`);

    // 3. Print tree
    console.log('\nðŸ“‚ Category Tree:');
    for (const parent of parents) {
        console.log(`  â”œâ”€â”€ ${parent.name}  (slug: ${parent.slug}, _id: ${parent._id})`);
        const level2 = categories.filter(c => c.parentId && c.parentId.equals(parent._id));
        for (let i = 0; i < level2.length; i++) {
            const child = level2[i];
            const prefix = i === level2.length - 1 ? '  â”‚   â””â”€â”€' : '  â”‚   â”œâ”€â”€';
            console.log(`${prefix} ${child.name}  (slug: ${child.slug})`);
            const level3 = categories.filter(c => c.parentId && c.parentId.equals(child._id));
            for (let j = 0; j < level3.length; j++) {
                const grandchild = level3[j];
                const p3 = j === level3.length - 1 ? '  â”‚       â””â”€â”€' : '  â”‚       â”œâ”€â”€';
                console.log(`${p3} ${grandchild.name}`);
            }
        }
    }

    // 4. Save Extended JSON
    const extJSON = toExtendedJSON(categories);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(extJSON, null, 2), 'utf-8');
    console.log(`\n[+] Categories saved: ${OUTPUT_FILE}`);

    // 5. Insert to MongoDB
    if (INSERT_TO_DB) {
        await insertToMongoDB(categories);
    }

    // 6. Sample output
    console.log(`\nðŸ“‹ Sample document (first category):`);
    console.log(JSON.stringify(extJSON[0], null, 2));
}

main().catch(err => {
    console.error('[ERROR]', err);
    process.exit(1);
});
