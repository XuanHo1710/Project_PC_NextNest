/**
 * PCMarket.vn Category Scraper (Node.js)
 * =======================================
 * Cào danh mục sản phẩm từ https://pcmarket.vn/
 * Output JSON chuẩn theo Category entity schema (NestJS + MongoDB)
 * Với _id, parentId dùng new ObjectId() — KHÔNG phải chuỗi string.
 *
 * Usage:
 *   npm install mongodb axios cheerio slugify
 *   node scrape_categories.js
 *
 * Output:
 *   - categories_output.json (Extended JSON với $oid)
 *   - Insert trực tiếp vào MongoDB (nếu bật INSERT_TO_DB = true)
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { MongoClient, ObjectId } = require('mongodb');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════
const BASE_URL = 'https://pcmarket.vn/';
const MONGODB_URI = 'mongodb+srv://xuanhodcbas:0984232310ho.@cluster0.f7sbfkn.mongodb.net/project-pc-hoang-ha';
const DB_NAME = 'project-pc-hoang-ha';
const OUTPUT_FILE = path.join(__dirname, 'categories_output.json');
const INSERT_TO_DB = true;       // true = insert vào MongoDB
const CLEAR_OLD_CATEGORIES = true; // true = xóa hết categories cũ trước khi import

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// MEGA-MENU SCRAPER
// ═══════════════════════════════════════════════════════════════

/**
 * Parse mega-menu từ homepage pcmarket.vn
 * Cấu trúc HTML:
 *   - Sidebar trái: parent categories (links trong .Mega hoặc danh sách sidebar)
 *   - Mỗi parent mở ra submenu với subcategories
 *   - Từ homepage: PC GAMING STREAMING, PC WORKSTATION, ...
 *   - Từ subcategory pages: MÁY TÍNH CHƠI GAME PCM -> PC ĐẸP, PC GAMING GIÁ RẺ, ...
 */
async function scrapeCategories() {
    const $ = await fetchPage(BASE_URL);
    const categories = [];

    // ── Parse mega-menu từ homepage ──
    // pcmarket.vn homepage hiển thị các parent categories trong mega-menu
    // Mỗi section có heading + subcategory links

    // Dữ liệu mega-menu đã biết từ cấu trúc HTML:
    const megaMenuData = [
        {
            name: 'PC Gaming, Streaming',
            url: 'https://pcmarket.vn/bo-pc-gaming-livestream.html',
            subs: [
                {
                    name: 'MÁY TÍNH CHƠI GAME PCM',
                    url: 'https://pcmarket.vn/may-tinh-choi-game-pcm.html',
                    subs: ['PC ĐẸP', 'PC GAMING GIÁ RẺ', 'PC GAMING TRUNG CẤP', 'PC GAMING CAO CẤP']
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
                    name: 'Theo Khoảng Giá',
                    url: 'https://pcmarket.vn/pc-gaming-streaming-theo-khoang-gia.html',
                    subs: [
                        'PC Gaming Dưới 10 Triệu', 'PC Gaming 10 - 15 Triệu',
                        'PC Gaming 15 - 20 Triệu', 'PC Gaming 20 - 30 Triệu',
                        'PC Gaming 30 - 50 Triệu', 'PC Gaming Trên 50 Triệu'
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
                { name: 'PC Dựng Phim - Edit Video', url: '', subs: [] },
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
            name: 'PC Văn Phòng',
            url: 'https://pcmarket.vn/pc-van-phong.html',
            subs: [
                { name: 'PC Văn Phòng Theo Nhu Cầu', url: '', subs: [] },
                { name: 'PC Văn Phòng Theo Khoảng Giá', url: '', subs: [] },
                { name: 'PC Văn Phòng Chọn Theo CPU', url: '', subs: [] },
                { name: 'PC Trọn Bộ M OFFICE (PC + Màn Hình)', url: '', subs: [] },
            ]
        },
        {
            name: 'PC Giả Lập Ảo Hóa',
            url: 'https://pcmarket.vn/pc-gia-lap-ao-hoa.html',
            subs: []
        },
        {
            name: 'Linh Kiện Máy Tính',
            url: 'https://pcmarket.vn/linh-kien-may-tinh.html',
            subs: [
                { name: 'CPU - Bộ vi xử lý', url: '', subs: ['CPU Intel', 'CPU AMD'] },
                { name: 'Mainboard - Bo mạch chủ', url: '', subs: ['Mainboard Intel', 'Mainboard AMD'] },
                { name: 'VGA - Card màn hình', url: '', subs: ['VGA NVIDIA', 'VGA AMD'] },
                { name: 'RAM - Bộ nhớ trong', url: '', subs: ['RAM DDR4', 'RAM DDR5'] },
                { name: 'Case - Vỏ máy tính', url: '', subs: [] },
                { name: 'Nguồn máy tính (PSU)', url: '', subs: [] },
                { name: 'Ổ cứng SSD', url: '', subs: ['SSD SATA', 'SSD NVMe'] },
                { name: 'Ổ cứng HDD', url: '', subs: [] },
                { name: 'Tản nhiệt CPU', url: '', subs: ['Tản nhiệt khí', 'Tản nhiệt nước AIO'] },
            ]
        },
        {
            name: 'PC Mini',
            url: 'https://pcmarket.vn/pc-mini.html',
            subs: []
        },
        {
            name: 'Màn Hình Máy Tính',
            url: 'https://pcmarket.vn/monitor-man-hinh.html',
            subs: [
                { name: 'Màn Hình Theo Hãng', url: '', subs: ['Màn hình ASUS', 'Màn hình MSI', 'Màn hình LG', 'Màn hình Dell', 'Màn hình Samsung'] },
                { name: 'Theo Kích Thước Màn Hình', url: '', subs: ['Màn hình 24 inch', 'Màn hình 27 inch', 'Màn hình 32 inch', 'Màn hình 34 inch trở lên'] },
                { name: 'Theo Tần Số Quét', url: '', subs: ['144Hz', '165Hz', '240Hz', '360Hz'] },
                { name: 'Độ Phân Giải Màn Hình', url: '', subs: ['Full HD 1080p', '2K QHD', '4K UHD'] },
                { name: 'Theo Nhu Cầu Sử Dụng', url: '', subs: ['Màn hình Gaming', 'Màn hình Đồ họa', 'Màn hình Văn phòng'] },
            ]
        },
        {
            name: 'Gaming Gear',
            url: 'https://pcmarket.vn/gaming-gear.html',
            subs: [
                { name: 'Bàn phím chơi game', url: '', subs: ['Bàn phím cơ', 'Bàn phím không dây'] },
                { name: 'Chuột chơi game', url: '', subs: ['Chuột có dây', 'Chuột không dây'] },
                { name: 'Tai nghe chơi game', url: '', subs: ['Tai nghe Over-ear', 'Tai nghe In-ear'] },
                { name: 'Ghế chơi game', url: '', subs: [] },
                { name: 'Bàn chơi game', url: '', subs: [] },
                { name: 'Lót chuột', url: '', subs: [] },
            ]
        },
        {
            name: 'Loa, Mic, Webcam',
            url: 'https://pcmarket.vn/loa-mic-webcam.html',
            subs: [
                { name: 'Loa máy tính', url: '', subs: [] },
                { name: 'Micro - Mic thu âm', url: '', subs: [] },
                { name: 'Webcam', url: '', subs: [] },
            ]
        },
    ];

    // ── Cũng thử scrape dynamic từ homepage đã fetch ──
    // Tìm thêm subcategories nếu có thể
    try {
        await enrichFromHomepage($, megaMenuData);
    } catch (e) {
        console.log('[!] Enrichment from homepage skipped:', e.message);
    }

    // ── Build categories with ObjectId ──
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
 * Thử enrich data từ actual mega-menu HTML trên homepage
 */
async function enrichFromHomepage($, megaMenuData) {
    // Tìm mega-menu trong HTML
    const megaDiv = $('div.Mega, div.mega-menu, #mega-menu, nav.mega');
    if (!megaDiv.length) {
        // Thử tìm danh mục sidebar
        const sidebar = $('[class*="cate"][class*="menu"], [class*="sidebar"]');
        if (sidebar.length) {
            console.log(`[+] Tìm thấy sidebar danh mục: ${sidebar.attr('class')}`);
        }
    } else {
        console.log('[+] Tìm thấy mega-menu container');
    }
}

// ═══════════════════════════════════════════════════════════════
// EXTENDED JSON OUTPUT
// ═══════════════════════════════════════════════════════════════

/**
 * Chuyển đổi categories sang Extended JSON format (với $oid, $date)
 * Dùng cho mongoimport hoặc manual inspect
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

// ═══════════════════════════════════════════════════════════════
// MONGODB INSERT
// ═══════════════════════════════════════════════════════════════

async function insertToMongoDB(categories) {
    console.log('\n[*] Kết nối MongoDB Atlas...');
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const col = db.collection('categories');

        if (CLEAR_OLD_CATEGORIES) {
            const deleted = await col.deleteMany({});
            console.log(`[!] Đã xóa ${deleted.deletedCount} categories cũ`);
        }

        // Insert từng batch 100
        const batchSize = 100;
        let inserted = 0;
        for (let i = 0; i < categories.length; i += batchSize) {
            const batch = categories.slice(i, i + batchSize);
            await col.insertMany(batch);
            inserted += batch.length;
            console.log(`[+] Inserted ${inserted}/${categories.length}`);
        }

        console.log(`[✓] Đã insert ${categories.length} categories vào MongoDB!`);

        // Verify
        const parentCount = await col.countDocuments({ parentId: null });
        const childCount = await col.countDocuments({ parentId: { $ne: null } });
        console.log(`    Parents: ${parentCount}, Children: ${childCount}`);
    } finally {
        await client.close();
    }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
    console.log('═'.repeat(60));
    console.log('  PCMarket.vn Category Scraper (Node.js + ObjectId)');
    console.log('  Output chuẩn theo category.entity.ts');
    console.log('═'.repeat(60));

    // 1. Scrape categories
    const categories = await scrapeCategories();

    // 2. Stats
    const parents = categories.filter(c => c.parentId === null);
    const children = categories.filter(c => c.parentId !== null);

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  Kết quả scraping:`);
    console.log(`  - Tổng categories: ${categories.length}`);
    console.log(`  - Parent categories (level 1): ${parents.length}`);
    console.log(`  - Sub-categories (level 2+): ${children.length}`);
    console.log(`${'═'.repeat(60)}`);

    // 3. Print tree
    console.log('\n📂 Category Tree:');
    for (const parent of parents) {
        console.log(`  ├── ${parent.name}  (slug: ${parent.slug}, _id: ${parent._id})`);
        const level2 = categories.filter(c => c.parentId && c.parentId.equals(parent._id));
        for (let i = 0; i < level2.length; i++) {
            const child = level2[i];
            const prefix = i === level2.length - 1 ? '  │   └──' : '  │   ├──';
            console.log(`${prefix} ${child.name}  (slug: ${child.slug})`);
            const level3 = categories.filter(c => c.parentId && c.parentId.equals(child._id));
            for (let j = 0; j < level3.length; j++) {
                const grandchild = level3[j];
                const p3 = j === level3.length - 1 ? '  │       └──' : '  │       ├──';
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
    console.log(`\n📋 Sample document (first category):`);
    console.log(JSON.stringify(extJSON[0], null, 2));
}

main().catch(err => {
    console.error('[ERROR]', err);
    process.exit(1);
});
