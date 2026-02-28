/**
 * PCMarket.vn Product Scraper (Node.js)
 * =======================================
 * Cào sản phẩm từ https://pcmarket.vn/ và tạo đầy đủ:
 *   - Brand (các thương hiệu PC nổi tiếng)
 *   - Product (sản phẩm chính)
 *   - ProductAttribute (thuộc tính: RAM, SSD, ...) — per createdBy
 *   - ProductAttributeValue (giá trị: 16GB, 32GB, ...) — per createdBy
 *   - ProductAttributeAllowValue (liên kết product ↔ attributeValue)
 *   - ProductVariant (biến thể sản phẩm từ tổ hợp thuộc tính)
 *
 * Mỗi ProductAttribute, ProductAttributeValue thuộc về 1 createdBy (guest),
 * KHÔNG public cho người khác dùng chung.
 *
 * Usage:
 *   npm install mongodb axios cheerio slugify
 *   node scrape_products.js
 *
 * Đọc .env hoặc hardcode MONGODB_URI. Guest account được query từ DB.
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
const MONGODB_URI = 'mongodb+srv://xuanhodcbas:0984232310ho.@cluster0.f7sbfkn.mongodb.net/project-pc-hoang-ha';
const DB_NAME = 'project-pc-hoang-ha';
const BASE_URL = 'https://pcmarket.vn';
const OUTPUT_DIR = __dirname;

// Số sản phẩm tối đa cào mỗi category page
const MAX_PRODUCTS_PER_CATEGORY = 12;
// Delay giữa các request (ms) — tránh spam server
const REQUEST_DELAY = 800;

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'vi-VN,vi;q=0.9',
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const slugMap = new Map();

function makeSlug(name) {
    let base = slugify(name, { lower: true, strict: true, locale: 'vi' });
    base = base.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!base) base = 'product';
    let slug = base;
    let count = 1;
    while (slugMap.has(slug)) { slug = `${base}-${count++}`; }
    slugMap.set(slug, true);
    return slug;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function parsePrice(text) {
    if (!text) return 0;
    const cleaned = text.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
}

function toExtJSON(doc) {
    const result = {};
    for (const [key, val] of Object.entries(doc)) {
        if (val instanceof ObjectId) {
            result[key] = { $oid: val.toHexString() };
        } else if (val instanceof Date) {
            result[key] = { $date: val.toISOString() };
        } else if (val instanceof Map) {
            const obj = {};
            val.forEach((v, k) => { obj[k] = v instanceof ObjectId ? { $oid: v.toHexString() } : v; });
            result[key] = obj;
        } else if (Array.isArray(val)) {
            result[key] = val.map(v => v instanceof ObjectId ? { $oid: v.toHexString() } : v);
        } else if (val && typeof val === 'object' && !(val instanceof ObjectId) && !(val instanceof Date)) {
            result[key] = toExtJSON(val);
        } else {
            result[key] = val;
        }
    }
    return result;
}

async function fetchPage(url) {
    const resp = await axios.get(url, { headers: HEADERS, timeout: 30000 });
    return cheerio.load(resp.data);
}

// ═══════════════════════════════════════════════════════════════
// BRAND DATA — Các thương hiệu PC nổi tiếng
// ═══════════════════════════════════════════════════════════════
const BRANDS_DATA = [
    { name: 'Intel', description: 'Nhà sản xuất CPU hàng đầu thế giới', website: 'https://www.intel.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/200px-Intel_logo_%282006-2020%29.svg.png' },
    { name: 'AMD', description: 'Advanced Micro Devices - CPU & GPU', website: 'https://www.amd.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/200px-AMD_Logo.svg.png' },
    { name: 'NVIDIA', description: 'Nhà sản xuất GPU, AI computing', website: 'https://www.nvidia.com', logo: 'https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/200px-Nvidia_logo.svg.png' },
    { name: 'ASUS', description: 'Mainboard, VGA, Laptop, Gaming Gear', website: 'https://www.asus.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/200px-ASUS_Logo.svg.png' },
    { name: 'MSI', description: 'Micro-Star International - Gaming & Professional', website: 'https://www.msi.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/MSI_Logo.svg/200px-MSI_Logo.svg.png' },
    { name: 'GIGABYTE', description: 'Mainboard, VGA, Laptop, PC Components', website: 'https://www.gigabyte.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Gigabyte_Technology_logo_20080107.svg/200px-Gigabyte_Technology_logo_20080107.svg.png' },
    { name: 'Corsair', description: 'RAM, PSU, Case, Gaming Peripherals', website: 'https://www.corsair.com', logo: '' },
    { name: 'NZXT', description: 'Case, Cooling, PC Components', website: 'https://nzxt.com', logo: '' },
    { name: 'Cooler Master', description: 'Case, PSU, Tản nhiệt, Gaming Gear', website: 'https://www.coolermaster.com', logo: '' },
    { name: 'Kingston', description: 'RAM, SSD, USB Flash Drive', website: 'https://www.kingston.com', logo: '' },
    { name: 'Samsung', description: 'SSD, RAM, Màn hình, Storage', website: 'https://www.samsung.com', logo: '' },
    { name: 'Western Digital', description: 'SSD, HDD, Storage Solutions', website: 'https://www.westerndigital.com', logo: '' },
    { name: 'Logitech', description: 'Chuột, Bàn phím, Tai nghe, Webcam', website: 'https://www.logitech.com', logo: '' },
    { name: 'Razer', description: 'Gaming Peripherals, Laptop Gaming', website: 'https://www.razer.com', logo: '' },
    { name: 'SteelSeries', description: 'Gaming Headset, Mouse, Keyboard', website: 'https://steelseries.com', logo: '' },
    { name: 'PCM', description: 'PC Market - Build PC Gaming & Workstation', website: 'https://pcmarket.vn', logo: '' },
    { name: 'ZOTAC', description: 'Card màn hình NVIDIA GeForce', website: 'https://www.zotac.com', logo: '' },
    { name: 'ASRock', description: 'Mainboard, VGA', website: 'https://www.asrock.com', logo: '' },
    { name: 'Thermaltake', description: 'Case, PSU, Cooling, Gaming Gear', website: 'https://www.thermaltake.com', logo: '' },
    { name: 'Dell', description: 'Laptop, Màn hình, PC, Server', website: 'https://www.dell.com', logo: '' },
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY PAGES TO SCRAPE
// ═══════════════════════════════════════════════════════════════
// Map category URL → tên category (để match với categories trong DB)
const CATEGORY_PAGES = [
    { url: '/may-tinh-choi-game-pcm.html', categorySlug: 'may-tinh-choi-game-pcm' },
    { url: '/pc-core-ultra', categorySlug: 'pc-core-ultra' },
    { url: '/pc-workstation-3d.html', categorySlug: 'pc-workstation-3d' },
    { url: '/pc-gaming-ddr5', categorySlug: 'pc-gaming-ddr5' },
    { url: '/pc-amd-gaming.html', categorySlug: 'pc-amd-gaming' },
];

// ═══════════════════════════════════════════════════════════════
// SCRAPE PRODUCT LIST PAGE
// ═══════════════════════════════════════════════════════════════

/**
 * Scrape danh sách sản phẩm từ 1 category page
 * HTML structure: .product_list .p-item
 *   - a.p-img href → detail URL
 *   - a.p-img img data-src → thumbnail image
 *   - .p-discount → "-5%"
 *   - a.p-name → product name
 *   - .p-price → sale price (VNĐ)
 *   - Giá gốc → element thứ 2 trong .p-price-group
 */
async function scrapeListPage(url) {
    console.log(`\n[*] Scraping list: ${BASE_URL}${url}`);
    const $ = await fetchPage(`${BASE_URL}${url}`);
    const products = [];

    $('.product_list .p-item, .product-list-2021 .p-item').each(function (i) {
        if (i >= MAX_PRODUCTS_PER_CATEGORY) return false; // limit

        const el = $(this);
        const detailUrl = el.find('a.p-img').attr('href') || el.find('a').first().attr('href');
        const thumbnail = el.find('a.p-img img').attr('data-src') || el.find('a.p-img img').attr('src') || '';
        const name = el.find('a.p-name').text().trim() || el.find('.p-name').text().trim();
        const discountText = el.find('.p-discount').text().trim(); // e.g., "-5%"
        const priceText = el.find('.p-price').first().text().trim();

        // Parse giá gốc từ element thứ 2
        const priceGroupEls = el.find('.p-price-group span');
        let marketPriceText = '';
        if (priceGroupEls.length > 1) {
            marketPriceText = priceGroupEls.eq(1).text().trim();
        }

        if (!name || !detailUrl) return;

        const salePrice = parsePrice(priceText);
        const marketPrice = parsePrice(marketPriceText) || salePrice;
        const discountPercent = parseInt(discountText.replace(/[^\d]/g, ''), 10) || 0;

        products.push({
            name,
            detailUrl: detailUrl.startsWith('http') ? detailUrl : `${BASE_URL}${detailUrl}`,
            thumbnail: thumbnail.startsWith('http') ? thumbnail : `${BASE_URL}${thumbnail}`,
            salePrice,
            marketPrice,
            discountPercent,
        });
    });

    console.log(`[+] Tìm thấy ${products.length} sản phẩm`);
    return products;
}

// ═══════════════════════════════════════════════════════════════
// SCRAPE PRODUCT DETAIL PAGE
// ═══════════════════════════════════════════════════════════════

/**
 * Scrape chi tiết 1 sản phẩm
 * HTML structure:
 *   - h1 → product name
 *   - .pd-price.js-variant-price → sale price
 *   - .pd-market-price → original price
 *   - .bk-product-price → numeric price (hidden)
 *   - .tb-hura8-variant-selection tr → variant options
 *   - Second <table> → component specs
 *   - .pro-desc-container → description HTML
 *   - img[src*="media/product"] → product images
 */
async function scrapeProductDetail(url) {
    console.log(`  [*] Detail: ${url}`);
    try {
        const $ = await fetchPage(url);

        // Name
        const name = $('h1').text().trim();

        // Price
        const salePrice = parsePrice($('.pd-price.js-variant-price').text());
        const marketPrice = parsePrice($('.pd-market-price').text()) || salePrice;
        const hiddenPrice = parsePrice($('.bk-product-price').text()) || salePrice;

        // Images (only product images, not category images)
        const images = [];
        $('img[src*="media/product"]').each(function () {
            const src = $(this).attr('src');
            if (src && !images.includes(src)) {
                const fullUrl = src.startsWith('http') ? src : `${BASE_URL}${src}`;
                // Bỏ thumbnail nhỏ (250_), lấy ảnh gốc
                images.push(fullUrl);
            }
        });
        // Deduplicate bằng cách lấy ảnh gốc (bỏ prefix 250_)
        const uniqueImages = [];
        const seenBase = new Set();
        for (const img of images) {
            const base = img.replace(/\/250_/, '/');
            if (!seenBase.has(base)) {
                seenBase.add(base);
                uniqueImages.push(base);
            }
        }

        // Variant options từ bảng variant
        const variantOptions = [];
        $('.tb-hura8-variant-selection tr').each(function () {
            const label = $(this).find('.variant-option-label, td').first().text().trim();
            if (!label) return;

            const values = [];
            $(this).find('label, .variant-option-item, td:not(.variant-option-label)').each(function () {
                const $el = $(this);
                // Tìm text trong label/span
                let val = $el.find('span').text().trim() || $el.text().trim();
                // Loại bỏ label trùng
                if (val && val !== label && !val.includes(label)) {
                    // Tách nhiều values nếu nối nhau
                    // Ví dụ: "Ram 16GB DDR4Ram 32GB DDR4" → split
                    const splits = val.match(/[A-Z][^A-Z]*/g) || [val];
                    if (splits.length > 1 && splits[0].length > 3) {
                        // Thử split theo pattern
                    }
                    values.push(val.trim());
                }
            });

            if (label && values.length > 0) {
                // Parse lại values — chúng có thể bị nối nhau
                const parsedValues = parseVariantValues(values);
                variantOptions.push({ label, values: parsedValues });
            }
        });

        // Specs table (bảng thứ 2, không phải variant table)
        const specs = [];
        $('table').each(function (i) {
            const cls = $(this).attr('class') || '';
            if (cls.includes('hura8-variant')) return; // skip variant table

            $(this).find('tr').each(function (j) {
                if (j === 0) return; // skip header
                const cells = [];
                $(this).find('td, th').each(function () {
                    cells.push($(this).text().trim());
                });
                if (cells.length >= 2) {
                    specs.push({
                        stt: cells[0],
                        component: cells[1],
                        qty: cells[2] || '1',
                        warranty: cells[3] || '',
                    });
                }
            });
        });

        // Description HTML
        const descContainer = $('.pro-desc-container');
        let description = '';
        if (descContainer.length) {
            description = descContainer.html()?.trim() || '';
        }

        return {
            name,
            salePrice: hiddenPrice || salePrice,
            marketPrice,
            images: uniqueImages.slice(0, 8), // max 8 images
            variantOptions,
            specs,
            description: description.substring(0, 5000), // limit size
        };
    } catch (err) {
        console.log(`  [!] Error scraping detail: ${err.message}`);
        return null;
    }
}

/**
 * Parse variant values bị nối nhau
 * Ví dụ: "Ram 16GB DDR4Ram 32GB DDR4" → ["Ram 16GB DDR4", "Ram 32GB DDR4"]
 */
function parseVariantValues(rawValues) {
    const result = [];
    for (const raw of rawValues) {
        // Thử split tại vị trí uppercase letter sau lowercase/digit
        // Pattern: "Ram 16GB DDR4Ram 32GB DDR4"
        const parts = raw.split(/(?<=[a-z0-9])(?=[A-Z][a-z])/);
        if (parts.length > 1) {
            result.push(...parts.map(p => p.trim()).filter(Boolean));
        } else {
            // Thử split tại dấu SSD
            const ssdParts = raw.split(/(?=SSD\s)/);
            if (ssdParts.length > 1) {
                result.push(...ssdParts.map(p => p.trim()).filter(Boolean));
            } else {
                if (raw.trim()) result.push(raw.trim());
            }
        }
    }
    return [...new Set(result)]; // deduplicate
}

// ═══════════════════════════════════════════════════════════════
// DATA BUILDERS — Tạo documents MongoDB
// ═══════════════════════════════════════════════════════════════

function buildBrand(brandData) {
    const now = new Date();
    return {
        _id: new ObjectId(),
        name: brandData.name,
        slug: makeSlug(brandData.name),
        description: brandData.description || '',
        logo: brandData.logo || '',
        website: brandData.website || '',
        status: 'ACTIVE',
        feature: false,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
    };
}

function buildProductAttribute(name, displayType, createdBy) {
    const now = new Date();
    const code = slugify(name, { lower: true, strict: true, locale: 'vi' })
        .replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
    return {
        _id: new ObjectId(),
        name,
        code: code || name.toLowerCase(),
        displayType, // 'BUTTON' | 'COLOR' | 'IMAGE' | 'RADIO'
        createdBy: new ObjectId(createdBy),
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
    };
}

function buildProductAttributeValue(value, label, attributeId, createdBy, colorHex = '', imageUrl = '') {
    const now = new Date();
    return {
        _id: new ObjectId(),
        value,
        label,
        attribute: new ObjectId(attributeId),
        colorHex,
        imageUrl,
        createdBy: new ObjectId(createdBy),
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
    };
}

function buildProductAttributeAllowValue(productId, attributeValueId) {
    const now = new Date();
    return {
        _id: new ObjectId(),
        product: new ObjectId(productId),
        attributeValue: new ObjectId(attributeValueId),
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
    };
}

function buildProduct(data) {
    const now = new Date();
    return {
        _id: new ObjectId(),
        name: data.name,
        slug: makeSlug(data.name),
        description: data.description || '',
        brand: data.brandId ? new ObjectId(data.brandId) : null,
        category: data.categoryId ? new ObjectId(data.categoryId) : null,
        minPrice: data.minPrice || 0,
        maxPrice: data.maxPrice || 0,
        status: 'ACTIVE',
        defaultProductVariantId: null, // sẽ set sau khi tạo variant
        totalRatings: 0,
        avgRating: 0,
        totalStock: data.totalStock || 0,
        createdBy: data.createdBy ? new ObjectId(data.createdBy) : null,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
    };
}

function buildProductVariant(data) {
    const now = new Date();
    return {
        _id: new ObjectId(),
        sku: data.sku,
        subDescription: data.subDescription || '',
        product: new ObjectId(data.productId),
        price: data.price,
        stock: data.stock || Math.floor(Math.random() * 50) + 5,
        discount: data.discount || 0,
        combination: data.combination, // Map<string, string> — { "ram": attrValueId, "ssd": attrValueId }
        images: data.images || [],
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
    };
}

// ═══════════════════════════════════════════════════════════════
// BRAND MATCHING — Detect brand từ tên sản phẩm
// ═══════════════════════════════════════════════════════════════

/**
 * Xác định brand dựa vào tên sản phẩm hoặc specs
 * Mặc định PC từ pcmarket.vn = "PCM" brand
 */
function detectBrand(productName, specs, brandMap) {
    const nameLower = productName.toLowerCase();
    const specText = specs.map(s => s.component || '').join(' ').toLowerCase();
    const combined = `${nameLower} ${specText}`;

    // Priority: nếu tên chứa brand name
    const brandPriority = ['ASUS', 'MSI', 'GIGABYTE', 'Corsair', 'NZXT', 'Dell', 'Logitech', 'Razer', 'ZOTAC', 'ASRock'];
    for (const brandName of brandPriority) {
        if (combined.includes(brandName.toLowerCase())) {
            return brandMap.get(brandName);
        }
    }

    // PC builds → PCM brand
    if (nameLower.includes('pc ') || nameLower.includes('pc-') || nameLower.startsWith('pc')) {
        return brandMap.get('PCM');
    }

    return brandMap.get('PCM'); // default
}

// ═══════════════════════════════════════════════════════════════
// MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════

async function main() {
    console.log('═'.repeat(60));
    console.log('  PCMarket.vn Product Scraper');
    console.log('  Brands + Products + Attributes + Variants');
    console.log('═'.repeat(60));

    // ── Connect MongoDB ──
    console.log('\n[*] Kết nối MongoDB Atlas...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    console.log('[+] Connected!');

    try {
        // ── 1. Lấy guest account cho createdBy ──
        console.log('\n[1] Tìm guest account cho createdBy...');
        const guest = await db.collection('accountguests').findOne({
            accountStatus: 'ACTIVE',
            isEmailVerified: true,
        }, { sort: { createdAt: 1 } });

        if (!guest) {
            throw new Error('Không tìm thấy guest account ACTIVE nào!');
        }
        const createdBy = guest._id.toHexString();
        console.log(`[+] Dùng guest: ${guest.fullname} (${guest.email}) — _id: ${createdBy}`);

        // ── 2. Tạo Brands ──
        console.log('\n[2] Tạo Brands...');
        const brands = BRANDS_DATA.map(b => buildBrand(b));
        const brandMap = new Map(); // name → brand doc
        for (const b of brands) { brandMap.set(b.name, b); }

        // Xóa brands cũ và insert mới (tùy chọn)
        await db.collection('brands').deleteMany({});
        if (brands.length > 0) {
            await db.collection('brands').insertMany(brands);
        }
        console.log(`[+] Đã tạo ${brands.length} brands`);

        // ── 3. Lấy categories từ DB ──
        console.log('\n[3] Lấy categories từ DB...');
        const allCategories = await db.collection('categories').find({ isDeleted: { $ne: true } }).toArray();
        console.log(`[+] Có ${allCategories.length} categories trong DB`);

        // Build category map by slug
        const categoryBySlug = new Map();
        for (const cat of allCategories) {
            categoryBySlug.set(cat.slug, cat);
        }

        // ── 4. Tạo ProductAttributes cho guest này ──
        console.log('\n[4] Tạo ProductAttributes...');
        const attrDefs = [
            { name: 'RAM', displayType: 'BUTTON' },
            { name: 'Ổ cứng SSD', displayType: 'BUTTON' },
            { name: 'CPU', displayType: 'BUTTON' },
            { name: 'VGA', displayType: 'BUTTON' },
        ];

        // Xóa attributes cũ của guest này
        await db.collection('productattributes').deleteMany({ createdBy: new ObjectId(createdBy) });
        await db.collection('productattributevalues').deleteMany({ createdBy: new ObjectId(createdBy) });

        const attributes = attrDefs.map(a => buildProductAttribute(a.name, a.displayType, createdBy));
        const attrMap = new Map(); // name → attribute doc
        for (const a of attributes) { attrMap.set(a.name, a); }

        if (attributes.length > 0) {
            await db.collection('productattributes').insertMany(attributes);
        }
        console.log(`[+] Đã tạo ${attributes.length} attributes: ${attrDefs.map(a => a.name).join(', ')}`);

        // ── 5. Scrape products từ pcmarket.vn ──
        console.log('\n[5] Scraping products từ pcmarket.vn...');

        const allProducts = [];    // Product docs
        const allVariants = [];    // ProductVariant docs
        const allAttrValues = [];  // ProductAttributeValue docs
        const allAllowValues = []; // ProductAttributeAllowValue docs

        // Cache attribute values by name to avoid duplicates
        const attrValueCache = new Map(); // "attrName::valueName" → attrValue doc

        // Deduplicate products by detail URL (cùng 1 sản phẩm xuất hiện ở nhiều category)
        const scrapedUrls = new Set();

        for (const catPage of CATEGORY_PAGES) {
            // Find matching category in DB
            let categoryId = null;
            const cat = categoryBySlug.get(catPage.categorySlug);
            if (cat) {
                categoryId = cat._id.toHexString();
                console.log(`\n── Category: ${cat.name} (${catPage.categorySlug}) ──`);
            } else {
                console.log(`\n── Category: ${catPage.categorySlug} (không tìm thấy trong DB, bỏ qua categoryId) ──`);
            }

            // Scrape list page
            const listItems = await scrapeListPage(catPage.url);
            await delay(REQUEST_DELAY);

            for (const item of listItems) {
                // Skip duplicate products (cùng URL xuất hiện ở nhiều category pages)
                if (scrapedUrls.has(item.detailUrl)) {
                    console.log(`  [~] Bỏ qua (duplicate): ${item.name}`);
                    continue;
                }
                scrapedUrls.add(item.detailUrl);

                const detail = await scrapeProductDetail(item.detailUrl);
                await delay(REQUEST_DELAY);

                if (!detail) continue;

                // Detect brand
                const brand = detectBrand(item.name, detail.specs || [], brandMap);
                const brandId = brand ? brand._id.toHexString() : null;

                // Parse variant options → create attribute values
                const variantDimensions = []; // [{ attrDoc, values: [attrValueDoc, ...] }]

                for (const opt of detail.variantOptions) {
                    // Match attribute by name
                    let attrDoc = attrMap.get(opt.label);
                    if (!attrDoc) {
                        // Tạo attribute mới nếu chưa có
                        attrDoc = buildProductAttribute(opt.label, 'BUTTON', createdBy);
                        attrMap.set(opt.label, attrDoc);
                        attributes.push(attrDoc);
                        await db.collection('productattributes').insertOne(attrDoc);
                        console.log(`    [+] Tạo mới attribute: ${opt.label}`);
                    }

                    const dimension = { attrDoc, values: [] };

                    for (const valText of opt.values) {
                        const cacheKey = `${attrDoc.name}::${valText}`;
                        let attrValueDoc = attrValueCache.get(cacheKey);

                        if (!attrValueDoc) {
                            attrValueDoc = buildProductAttributeValue(
                                valText, valText, attrDoc._id.toHexString(), createdBy
                            );
                            attrValueCache.set(cacheKey, attrValueDoc);
                            allAttrValues.push(attrValueDoc);
                        }

                        dimension.values.push(attrValueDoc);
                    }

                    variantDimensions.push(dimension);
                }

                // Tính min/max price
                const basePrice = detail.salePrice || item.salePrice;
                const originalPrice = detail.marketPrice || item.marketPrice || basePrice;
                const discount = item.discountPercent || 0;

                // Build Product
                const product = buildProduct({
                    name: detail.name || item.name,
                    description: detail.description,
                    brandId,
                    categoryId,
                    minPrice: basePrice,
                    maxPrice: originalPrice,
                    totalStock: 0,
                    createdBy,
                });

                // Build AllowValues (link product → attribute values)
                for (const dim of variantDimensions) {
                    for (const attrVal of dim.values) {
                        allAllowValues.push(
                            buildProductAttributeAllowValue(product._id.toHexString(), attrVal._id.toHexString())
                        );
                    }
                }

                // Build Variants (tổ hợp từ các dimensions)
                const variants = generateVariants(product, variantDimensions, {
                    basePrice: originalPrice,
                    discount,
                    images: detail.images,
                    specs: detail.specs,
                });

                if (variants.length === 0) {
                    // Không có variant options → tạo 1 default variant
                    const defaultVariant = buildProductVariant({
                        sku: `${product.slug.substring(0, 30).toUpperCase().replace(/-/g, '_')}-DEF-001`,
                        subDescription: detail.specs.map(s => s.component).join(', ').substring(0, 200),
                        productId: product._id.toHexString(),
                        price: originalPrice,
                        stock: Math.floor(Math.random() * 50) + 5,
                        discount,
                        combination: {},
                        images: detail.images,
                    });
                    variants.push(defaultVariant);
                }

                // Set default variant
                product.defaultProductVariantId = variants[0]._id;
                product.totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

                allProducts.push(product);
                allVariants.push(...variants);

                console.log(`  [✓] ${product.name} → ${variants.length} variants, brand: ${brand?.name || 'N/A'}`);
            }
        }

        // ── 6. Insert tất cả vào MongoDB ──
        console.log('\n[6] Inserting vào MongoDB...');

        // Xóa products cũ của guest này
        const oldProductIds = (await db.collection('products').find({ createdBy: new ObjectId(createdBy) }).project({ _id: 1 }).toArray()).map(p => p._id);
        if (oldProductIds.length > 0) {
            await db.collection('productvariants').deleteMany({ product: { $in: oldProductIds } });
            await db.collection('productattributeallowvalues').deleteMany({ product: { $in: oldProductIds } });
            await db.collection('products').deleteMany({ createdBy: new ObjectId(createdBy) });
            console.log(`[!] Đã xóa ${oldProductIds.length} products cũ của guest`);
        }

        // Insert attribute values
        if (allAttrValues.length > 0) {
            await db.collection('productattributevalues').insertMany(allAttrValues, { ordered: false }).catch(e => console.log(`[!] Attr values: ${e.insertedCount || 0} inserted, some duplicates skipped`));
            console.log(`[+] Inserted ${allAttrValues.length} attribute values`);
        }

        // Insert products
        if (allProducts.length > 0) {
            await db.collection('products').insertMany(allProducts, { ordered: false }).catch(e => console.log(`[!] Products: ${e.insertedCount || 0} inserted, some duplicates skipped`));
            console.log(`[+] Inserted ${allProducts.length} products`);
        }

        // Insert variants
        if (allVariants.length > 0) {
            await db.collection('productvariants').insertMany(allVariants, { ordered: false }).catch(e => console.log(`[!] Variants: ${e.insertedCount || 0} inserted, some duplicates skipped`));
            console.log(`[+] Inserted ${allVariants.length} variants`);
        }

        // Insert allow values
        if (allAllowValues.length > 0) {
            await db.collection('productattributeallowvalues').insertMany(allAllowValues, { ordered: false }).catch(e => console.log(`[!] Allow values: ${e.insertedCount || 0} inserted, some duplicates skipped`));
            console.log(`[+] Inserted ${allAllowValues.length} allow values`);
        }

        // ── 7. Export JSON ──
        console.log('\n[7] Exporting JSON files...');

        const exportData = {
            brands: brands.map(toExtJSON),
            products: allProducts.map(toExtJSON),
            productVariants: allVariants.map(toExtJSON),
            productAttributes: attributes.map(toExtJSON),
            productAttributeValues: allAttrValues.map(toExtJSON),
            productAttributeAllowValues: allAllowValues.map(toExtJSON),
        };

        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'products_output.json'),
            JSON.stringify(exportData, null, 2),
            'utf-8'
        );
        console.log(`[+] Exported: products_output.json`);

        // ── 8. Summary ──
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`  📊 Summary:`);
        console.log(`  - Brands: ${brands.length}`);
        console.log(`  - Products: ${allProducts.length}`);
        console.log(`  - Variants: ${allVariants.length}`);
        console.log(`  - Attributes: ${attributes.length}`);
        console.log(`  - Attribute Values: ${allAttrValues.length}`);
        console.log(`  - Allow Values: ${allAllowValues.length}`);
        console.log(`  - createdBy: ${guest.fullname} (${createdBy})`);
        console.log(`${'═'.repeat(60)}`);

    } finally {
        await client.close();
        console.log('\n[*] MongoDB connection closed.');
    }
}

// ═══════════════════════════════════════════════════════════════
// VARIANT GENERATOR — Tổ hợp từ các dimensions
// ═══════════════════════════════════════════════════════════════

/**
 * Sinh tổ hợp variants từ các variant dimensions
 * Ví dụ: RAM [16GB, 32GB] x SSD [256GB, 500GB] = 4 variants
 *
 * Mỗi variant có combination = { "ram": attrValueId, "ssd": attrValueId }
 * Price tăng dần theo index (variant đắt hơn nếu option cao hơn)
 */
function generateVariants(product, dimensions, opts) {
    if (dimensions.length === 0) return [];

    const { basePrice, discount, images, specs } = opts;

    // Tạo tổ hợp (cartesian product)
    const combinations = cartesianProduct(dimensions.map(d => d.values));

    // Product slug prefix for SKU uniqueness
    const productSlugPrefix = product.slug.substring(0, 25).toUpperCase().replace(/-/g, '_');

    const variants = [];
    for (let i = 0; i < combinations.length; i++) {
        const combo = combinations[i];
        const combination = {};
        const skuParts = [];

        for (let j = 0; j < dimensions.length; j++) {
            const attrDoc = dimensions[j].attrDoc;
            const attrValue = combo[j];
            combination[attrDoc.code] = attrValue._id.toHexString();
            skuParts.push(attrValue.value.replace(/\s+/g, '-').substring(0, 15));
        }

        // Price variation: tăng ~5% cho mỗi tier cao hơn
        const priceMultiplier = 1 + (i * 0.05);
        const variantPrice = Math.round(basePrice * priceMultiplier);

        const variant = buildProductVariant({
            sku: `${productSlugPrefix}-${skuParts.join('-').toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
            subDescription: specs?.map(s => s.component).join(', ').substring(0, 200) || '',
            productId: product._id.toHexString(),
            price: variantPrice,
            stock: Math.floor(Math.random() * 50) + 5,
            discount,
            combination,
            images: images || [],
        });

        variants.push(variant);
    }

    return variants;
}

/**
 * Cartesian product
 * [[a1,a2], [b1,b2]] → [[a1,b1], [a1,b2], [a2,b1], [a2,b2]]
 */
function cartesianProduct(arrays) {
    if (arrays.length === 0) return [[]];
    return arrays.reduce(
        (acc, arr) => acc.flatMap(combo => arr.map(item => [...combo, item])),
        [[]]
    );
}

// ═══════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════
main().catch(err => {
    console.error('[FATAL ERROR]', err);
    process.exit(1);
});
