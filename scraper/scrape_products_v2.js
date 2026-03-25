/**
 * PC Product Scraper v2 — pcmarket.vn + gearvn.com
 * ==================================================
 * - pcmarket.vn: Scrape products WITH native variant selectors (RAM/SSD)
 * - gearvn.com: Scrape via Shopify JSON API, group related products as variants
 *
 * CRITICAL FIX: combination now stores LABEL text (e.g. "16GB DDR4")
 * instead of ObjectId references.
 *
 * Usage:
 *   npm install mongodb axios cheerio slugify
 *   node scrape_products_v2.js
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
const OUTPUT_DIR = __dirname;

const MAX_PRODUCTS_PER_CATEGORY = 15;
const REQUEST_DELAY = 1000;

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

async function fetchPage(url) {
    const resp = await axios.get(url, { headers: HEADERS, timeout: 30000 });
    return cheerio.load(resp.data);
}

async function fetchJSON(url) {
    const resp = await axios.get(url, { headers: HEADERS, timeout: 30000 });
    return resp.data;
}

/**
 * Clean raw scraped HTML description:
 * - Remove script/style/noscript/iframe/link/meta/form tags
 * - Remove navigation, header, footer chrome
 * - Extract meaningful content from CellphoneS __nuxt pages
 * - Remove tracking pixels, inline event handlers
 * - Remove payment/shipping/coupon sections
 * - Strip empty tags, collapse whitespace
 * - Cap at 5000 chars
 */
function cleanDescription(html) {
    if (!html || typeof html !== 'string') return '';
    let cleaned = html;

    // 1. Remove script, style, noscript, iframe, link, meta, form, object, embed
    cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
    cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
    cleaned = cleaned.replace(/<(noscript|iframe|link|meta|object|embed|form|svg)[\s\S]*?(<\/\1>|\/?>)/gi, '');

    // 2. Remove HTML comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

    // 3. For CellphoneS/Nuxt wrapped pages, extract article content
    if (cleaned.includes('data-server-rendered') || cleaned.includes('__nuxt') || cleaned.includes('__layout')) {
        const articleMatch = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
        if (articleMatch) {
            cleaned = articleMatch[1];
        } else {
            const mainMatch = cleaned.match(/<div[^>]*class="[^"]*(?:product-detail|content-body|detail-content|article-content)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>)?/i);
            if (mainMatch) cleaned = mainMatch[1];
        }
    }

    // 4. Remove navigation, header, footer
    cleaned = cleaned.replace(/<nav[\s\S]*?<\/nav>/gi, '');
    cleaned = cleaned.replace(/<header[\s\S]*?<\/header>/gi, '');
    cleaned = cleaned.replace(/<footer[\s\S]*?<\/footer>/gi, '');

    // 5. Remove Shopify/site-chrome patterns
    const sitePatterns = [
        /DANH MỤC SẢN PHẨM/i,
        /Giỏ hàng/i,
        /ĐĂNG KÝ NHẬN TIN/i,
        /Phương thức thanh toán/i,
        /window\.__NUXT__/,
        /gtm\.start/,
        /googletagmanager\.com/,
        /google-analytics\.com/,
        /facebook\.com\/tr/,
        /zalo\.me\/widget/,
    ];
    // Remove divs containing these patterns (up to 2000 chars around them)
    for (const pat of sitePatterns) {
        cleaned = cleaned.replace(new RegExp(`<div[^>]*>[\\s\\S]{0,2000}?${pat.source}[\\s\\S]{0,2000}?<\\/div>`, 'gi'), '');
    }

    // 6. Remove inline event handlers & data-tracking attributes
    cleaned = cleaned.replace(/\s(on\w+|data-gtm|data-analytics|data-tracking|data-server-rendered)="[^"]*"/gi, '');

    // 7. Remove tracking pixels and invisible images
    cleaned = cleaned.replace(/<img[^>]*(?:tracking|pixel|facebook\.com\/tr|google-analytics|1x1|spacer)[^>]*\/?>/gi, '');

    // 8. Remove empty tags (3 passes)
    for (let i = 0; i < 3; i++) {
        cleaned = cleaned.replace(/<(\w+)[^>]*>\s*<\/\1>/g, '');
    }

    // 9. Collapse whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');
    cleaned = cleaned.trim();

    // 10. Cap at 5000 chars at a good breakpoint
    if (cleaned.length > 5000) {
        const breakpoint = cleaned.lastIndexOf('</p>', 5000);
        if (breakpoint > 3000) {
            cleaned = cleaned.substring(0, breakpoint + 4);
        } else {
            cleaned = cleaned.substring(0, 5000);
        }
    }

    return cleaned;
}

// ═══════════════════════════════════════════════════════════════
// BRAND DATA
// ═══════════════════════════════════════════════════════════════
const BRANDS_DATA = [
    { name: 'Intel', description: 'Nhà sản xuất CPU hàng đầu thế giới', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/200px-Intel_logo_%282006-2020%29.svg.png' },
    { name: 'AMD', description: 'Advanced Micro Devices - CPU & GPU', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/200px-AMD_Logo.svg.png' },
    { name: 'NVIDIA', description: 'Nhà sản xuất GPU, AI computing', logo: 'https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/200px-Nvidia_logo.svg.png' },
    { name: 'ASUS', description: 'Mainboard, VGA, Laptop, Gaming Gear', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/200px-ASUS_Logo.svg.png' },
    { name: 'MSI', description: 'Micro-Star International - Gaming', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/MSI_Logo.svg/200px-MSI_Logo.svg.png' },
    { name: 'GIGABYTE', description: 'Mainboard, VGA, Laptop, PC Components', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Gigabyte_Technology_logo_20080107.svg/200px-Gigabyte_Technology_logo_20080107.svg.png' },
    { name: 'Corsair', description: 'RAM, PSU, Case, Gaming Peripherals', logo: '' },
    { name: 'NZXT', description: 'Case, Cooling, PC Components', logo: '' },
    { name: 'Cooler Master', description: 'Case, PSU, Tản nhiệt, Gaming Gear', logo: '' },
    { name: 'Kingston', description: 'RAM, SSD, USB Flash Drive', logo: '' },
    { name: 'Samsung', description: 'SSD, RAM, Màn hình, Storage', logo: '' },
    { name: 'Western Digital', description: 'SSD, HDD, Storage Solutions', logo: '' },
    { name: 'Logitech', description: 'Chuột, Bàn phím, Tai nghe, Webcam', logo: '' },
    { name: 'Razer', description: 'Gaming Peripherals, Laptop Gaming', logo: '' },
    { name: 'SteelSeries', description: 'Gaming Headset, Mouse, Keyboard', logo: '' },
    { name: 'PCM', description: 'PC Market - Build PC Gaming & Workstation', logo: '' },
    { name: 'ZOTAC', description: 'Card màn hình NVIDIA GeForce', logo: '' },
    { name: 'ASRock', description: 'Mainboard, VGA', logo: '' },
    { name: 'Thermaltake', description: 'Case, PSU, Cooling, Gaming Gear', logo: '' },
    { name: 'Dell', description: 'Laptop, Màn hình, PC, Server', logo: '' },
    { name: 'GVN', description: 'GearVN - PC Gaming & Workstation', logo: '' },
    { name: 'Colorful', description: 'VGA, Mainboard, SSD', logo: '' },
    { name: 'Lian Li', description: 'Case, Cooling cao cấp', logo: '' },
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY PAGES TO SCRAPE (pcmarket.vn)
// ═══════════════════════════════════════════════════════════════
const PCM_CATEGORY_PAGES = [
    { url: '/may-tinh-choi-game-pcm.html', categorySlug: 'may-tinh-choi-game-pcm' },
    { url: '/pc-core-ultra', categorySlug: 'pc-core-ultra' },
    { url: '/pc-workstation-3d.html', categorySlug: 'pc-workstation-3d' },
    { url: '/pc-gaming-ddr5', categorySlug: 'pc-gaming-ddr5' },
    { url: '/pc-amd-gaming.html', categorySlug: 'pc-amd-gaming' },
    { url: '/man-hinh-may-tinh.html', categorySlug: 'man-hinh-may-tinh' },
    { url: '/pc-van-phong-hoc-tap.html', categorySlug: 'pc-van-phong-hoc-tap' },
    { url: '/pc-gaming-streaming.html', categorySlug: 'pc-gaming-streaming' },
];

// GearVN Shopify collections to scrape
const GEARVN_COLLECTIONS = [
    { handle: 'pc-ban-chay', categorySlug: 'may-tinh-choi-game-pcm', brandDefault: 'GVN' },
    { handle: 'laptop-gaming-ban-chay', categorySlug: 'laptop', brandDefault: null },
    { handle: 'man-hinh-gaming-ban-chay', categorySlug: 'man-hinh-may-tinh', brandDefault: null },
    { handle: 'ban-phim-co-ban-chay', categorySlug: 'ban-phim-choi-game', brandDefault: null },
    { handle: 'chuot-gaming-ban-chay', categorySlug: 'chuot-choi-game', brandDefault: null },
    { handle: 'tai-nghe-gaming-ban-chay', categorySlug: 'tai-nghe-choi-game', brandDefault: null },
];

// ═══════════════════════════════════════════════════════════════
// DOCUMENT BUILDERS
// ═══════════════════════════════════════════════════════════════

function buildBrand(data) {
    const now = new Date();
    return {
        _id: new ObjectId(),
        name: data.name,
        slug: makeSlug(data.name),
        description: data.description || '',
        logo: data.logo || '',
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
        displayType,
        createdBy: new ObjectId(createdBy),
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
    };
}

function buildProductAttributeValue(value, label, attributeId, createdBy) {
    const now = new Date();
    return {
        _id: new ObjectId(),
        value,
        label,
        attribute: new ObjectId(attributeId),
        colorHex: '',
        imageUrl: '',
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
        defaultProductVariantId: null,
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
        // ★ CRITICAL: combination stores LABEL text, NOT ObjectId
        // e.g. { "ram": "16GB DDR4", "o-cung-ssd": "SSD 500GB" }
        combination: data.combination,
        images: data.images || [],
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
    };
}

// ═══════════════════════════════════════════════════════════════
// PCMARKET.VN SCRAPER (has variant selectors)
// ═══════════════════════════════════════════════════════════════

async function scrapeListPage(url) {
    console.log(`\n[PCM] Scraping list: https://pcmarket.vn${url}`);
    const $ = await fetchPage(`https://pcmarket.vn${url}`);
    const products = [];

    $('.product_list .p-item, .product-list-2021 .p-item').each(function (i) {
        if (i >= MAX_PRODUCTS_PER_CATEGORY) return false;
        const el = $(this);
        const detailUrl = el.find('a.p-img').attr('href') || el.find('a').first().attr('href');
        const name = el.find('a.p-name').text().trim() || el.find('.p-name').text().trim();
        const discountText = el.find('.p-discount').text().trim();
        const priceText = el.find('.p-price').first().text().trim();
        const priceGroupEls = el.find('.p-price-group span');
        let marketPriceText = '';
        if (priceGroupEls.length > 1) { marketPriceText = priceGroupEls.eq(1).text().trim(); }

        if (!name || !detailUrl) return;

        products.push({
            name,
            detailUrl: detailUrl.startsWith('http') ? detailUrl : `https://pcmarket.vn${detailUrl}`,
            salePrice: parsePrice(priceText),
            marketPrice: parsePrice(marketPriceText) || parsePrice(priceText),
            discountPercent: parseInt(discountText.replace(/[^\d]/g, ''), 10) || 0,
        });
    });

    console.log(`[PCM] Tìm thấy ${products.length} sản phẩm`);
    return products;
}

async function scrapeProductDetail(url) {
    console.log(`  [PCM] Detail: ${url}`);
    try {
        const $ = await fetchPage(url);
        const name = $('h1').text().trim();
        const salePrice = parsePrice($('.pd-price.js-variant-price').text());
        const marketPrice = parsePrice($('.pd-market-price').text()) || salePrice;
        const hiddenPrice = parsePrice($('.bk-product-price').text()) || salePrice;

        // Images
        const images = [];
        const seenBase = new Set();
        $('img[src*="media/product"]').each(function () {
            const src = $(this).attr('src');
            if (src) {
                const fullUrl = src.startsWith('http') ? src : `https://pcmarket.vn${src}`;
                const base = fullUrl.replace(/\/250_/, '/');
                if (!seenBase.has(base)) {
                    seenBase.add(base);
                    images.push(base);
                }
            }
        });

        // Variant options
        const variantOptions = [];
        $('.tb-hura8-variant-selection tr').each(function () {
            const label = $(this).find('.variant-option-label, td').first().text().trim();
            if (!label) return;
            const values = [];
            $(this).find('label, .variant-option-item, td:not(.variant-option-label)').each(function () {
                let val = $(this).find('span').text().trim() || $(this).text().trim();
                if (val && val !== label && !val.includes(label)) {
                    values.push(val.trim());
                }
            });
            if (label && values.length > 0) {
                const parsedValues = parseVariantValues(values);
                variantOptions.push({ label, values: parsedValues });
            }
        });

        // Specs table
        const specs = [];
        $('table').each(function () {
            const cls = $(this).attr('class') || '';
            if (cls.includes('hura8-variant')) return;
            $(this).find('tr').each(function (j) {
                if (j === 0) return;
                const cells = [];
                $(this).find('td, th').each(function () { cells.push($(this).text().trim()); });
                if (cells.length >= 2) {
                    specs.push({ component: cells[1], warranty: cells[3] || '' });
                }
            });
        });

        // Description
        const descContainer = $('.pro-desc-container');
        let description = descContainer.length ? (descContainer.html()?.trim() || '') : '';

        return {
            name,
            salePrice: hiddenPrice || salePrice,
            marketPrice,
            images: images.slice(0, 8),
            variantOptions,
            specs,
            description: cleanDescription(description),
        };
    } catch (err) {
        console.log(`  [!] Error: ${err.message}`);
        return null;
    }
}

function parseVariantValues(rawValues) {
    const result = [];
    for (const raw of rawValues) {
        const parts = raw.split(/(?<=[a-z0-9])(?=[A-Z][a-z])/);
        if (parts.length > 1) { result.push(...parts.map(p => p.trim()).filter(Boolean)); }
        else {
            const ssdParts = raw.split(/(?=SSD\s)/);
            if (ssdParts.length > 1) { result.push(...ssdParts.map(p => p.trim()).filter(Boolean)); }
            else if (raw.trim()) { result.push(raw.trim()); }
        }
    }
    return [...new Set(result)];
}

// ═══════════════════════════════════════════════════════════════
// GEARVN.COM SCRAPER (Shopify JSON API)
// ═══════════════════════════════════════════════════════════════

async function scrapeGearVNCollection(handle, limit = 15) {
    console.log(`\n[GVN] Scraping collection: ${handle}`);
    const products = [];
    try {
        // Shopify collections JSON endpoint
        const url = `https://gearvn.com/collections/${handle}/products.json?limit=${limit}`;
        const data = await fetchJSON(url);
        if (!data.products) {
            console.log(`[GVN] No products found`);
            return [];
        }

        for (const p of data.products.slice(0, limit)) {
            const variant = p.variants?.[0];
            const image = p.images?.[0]?.src || p.image?.src || '';

            products.push({
                name: p.title,
                description: cleanDescription(p.body_html || ''),
                salePrice: parsePrice(variant?.price || '0'),
                marketPrice: parsePrice(variant?.compare_at_price || variant?.price || '0'),
                images: (p.images || []).map(img => img.src).slice(0, 8),
                shopifyVariants: p.variants || [],
                vendor: p.vendor || '',
                tags: p.tags || [],
                productType: p.product_type || '',
                handle: p.handle,
            });
        }

        console.log(`[GVN] Tìm thấy ${products.length} sản phẩm`);
    } catch (err) {
        console.log(`[GVN] Error: ${err.message}`);
    }
    return products;
}

// ═══════════════════════════════════════════════════════════════
// BRAND DETECTION
// ═══════════════════════════════════════════════════════════════

function detectBrand(productName, brandMap, defaultBrand = null) {
    const nameLower = productName.toLowerCase();
    const brandPriority = ['ASUS', 'MSI', 'GIGABYTE', 'Corsair', 'NZXT', 'Dell', 'Logitech',
        'Razer', 'ZOTAC', 'ASRock', 'Colorful', 'Lian Li', 'SteelSeries',
        'Kingston', 'Samsung', 'Thermaltake', 'Cooler Master', 'AMD', 'Intel', 'NVIDIA'];
    for (const brandName of brandPriority) {
        if (nameLower.includes(brandName.toLowerCase())) return brandMap.get(brandName);
    }
    if (defaultBrand && brandMap.has(defaultBrand)) return brandMap.get(defaultBrand);
    if (nameLower.includes('pc ') || nameLower.includes('pc-') || nameLower.startsWith('pc')) {
        return brandMap.get('PCM');
    }
    return brandMap.get('GVN');
}

// ═══════════════════════════════════════════════════════════════
// VARIANT GENERATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Generate variants from dimensions.
 * ★ CRITICAL FIX: combination[attrCode] = attrValue.label (NOT attrValue._id)
 */
function generateVariants(product, dimensions, opts) {
    if (dimensions.length === 0) return [];
    const { basePrice, discount, images, specs } = opts;
    const combinations = cartesianProduct(dimensions.map(d => d.values));
    const productSlugPrefix = product.slug.substring(0, 25).toUpperCase().replace(/-/g, '_');

    const variants = [];
    for (let i = 0; i < combinations.length; i++) {
        const combo = combinations[i];
        const combination = {};
        const skuParts = [];

        for (let j = 0; j < dimensions.length; j++) {
            const attrDoc = dimensions[j].attrDoc;
            const attrValue = combo[j];
            // ★ FIX: Use label text instead of ObjectId
            combination[attrDoc.code] = attrValue.label;
            skuParts.push(attrValue.value.replace(/\s+/g, '-').substring(0, 15));
        }

        // Price variation: each tier ~3-8% more expensive
        const priceStep = Math.round(basePrice * (0.03 + Math.random() * 0.05));
        const variantPrice = basePrice + (i * priceStep);

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
 * Generate variants from GearVN Shopify variants.
 * Shopify variants have option1/option2/option3 as text labels → perfect for combination.
 */
function generateShopifyVariants(product, shopifyProduct, attrMap, attrValueCache, allAttrValues, allAllowValues, createdBy) {
    const shopifyVariants = shopifyProduct.shopifyVariants || [];
    if (shopifyVariants.length <= 1) return []; // only default variant, no real options

    // Detect option names from Shopify data
    // Shopify variants have option1, option2, option3
    // We need to figure out the attribute names from the variant titles
    const optionNames = [];
    // Check first variant for which options have different values
    const uniqueOpt1 = new Set(shopifyVariants.map(v => v.option1).filter(Boolean));
    const uniqueOpt2 = new Set(shopifyVariants.map(v => v.option2).filter(Boolean));
    const uniqueOpt3 = new Set(shopifyVariants.map(v => v.option3).filter(Boolean));

    if (uniqueOpt1.size > 1) optionNames.push({ index: 1, name: guessOptionName([...uniqueOpt1]) });
    if (uniqueOpt2.size > 1) optionNames.push({ index: 2, name: guessOptionName([...uniqueOpt2]) });
    if (uniqueOpt3.size > 1) optionNames.push({ index: 3, name: guessOptionName([...uniqueOpt3]) });

    if (optionNames.length === 0) return [];

    const productSlugPrefix = product.slug.substring(0, 25).toUpperCase().replace(/-/g, '_');
    const variants = [];

    for (let i = 0; i < shopifyVariants.length; i++) {
        const sv = shopifyVariants[i];
        const combination = {};
        const skuParts = [];

        for (const opt of optionNames) {
            const val = sv[`option${opt.index}`];
            if (!val) continue;

            // Ensure attribute exists
            let attrDoc = attrMap.get(opt.name);
            if (!attrDoc) {
                attrDoc = buildProductAttribute(opt.name, 'BUTTON', createdBy);
                attrMap.set(opt.name, attrDoc);
            }

            // Ensure attribute value exists
            const cacheKey = `${attrDoc.name}::${val}`;
            let attrValueDoc = attrValueCache.get(cacheKey);
            if (!attrValueDoc) {
                attrValueDoc = buildProductAttributeValue(val, val, attrDoc._id.toHexString(), createdBy);
                attrValueCache.set(cacheKey, attrValueDoc);
                allAttrValues.push(attrValueDoc);
            }

            // AllowValue
            allAllowValues.push(buildProductAttributeAllowValue(product._id.toHexString(), attrValueDoc._id.toHexString()));

            // ★ Use label text in combination
            combination[attrDoc.code] = attrValueDoc.label;
            skuParts.push(val.replace(/\s+/g, '-').substring(0, 15));
        }

        const price = parsePrice(sv.price || '0');
        if (price === 0) continue;

        const compareAt = parsePrice(sv.compare_at_price || '0');
        let discount = 0;
        if (compareAt > price) {
            discount = Math.round((1 - price / compareAt) * 100);
        }

        const variant = buildProductVariant({
            sku: sv.sku || `${productSlugPrefix}-${skuParts.join('-').toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
            subDescription: sv.title || '',
            productId: product._id.toHexString(),
            price: compareAt > 0 ? compareAt : price,
            stock: Math.floor(Math.random() * 50) + 5,
            discount,
            combination,
            images: shopifyProduct.images || [],
        });
        variants.push(variant);
    }

    return variants;
}

function guessOptionName(values) {
    const joined = values.join(' ').toLowerCase();
    if (joined.match(/\b(gb|ram|ddr)\b/i)) return 'RAM';
    if (joined.match(/\b(ssd|nvme|hdd|tb)\b/i)) return 'Ổ cứng SSD';
    if (joined.match(/\b(rtx|gtx|rx|vga|gpu|radeon|geforce)\b/i)) return 'VGA';
    if (joined.match(/\b(i[3579]|ryzen|core|cpu|ultra)\b/i)) return 'CPU';
    if (joined.match(/\b(den|trang|xanh|do|hong|black|white|red|blue|pink|green|silver|gray)\b/i)) return 'Màu sắc';
    if (joined.match(/\b(27|24|32|34|inch|"|hz|144|240|360)\b/i)) return 'Kích thước';
    return 'Phiên bản';
}

function cartesianProduct(arrays) {
    if (arrays.length === 0) return [[]];
    return arrays.reduce(
        (acc, arr) => acc.flatMap(combo => arr.map(item => [...combo, item])),
        [[]]
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════

async function main() {
    console.log('═'.repeat(60));
    console.log('  Product Scraper v2 — pcmarket.vn + gearvn.com');
    console.log('  ★ FIX: combination uses LABEL text, not ObjectId');
    console.log('═'.repeat(60));

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    console.log('[+] Connected to MongoDB Atlas');

    try {
        // ── 1. Get guest account ──
        console.log('\n[1] Tìm guest account...');
        const guest = await db.collection('accountguests').findOne({
            accountStatus: 'ACTIVE', isEmailVerified: true
        }, { sort: { createdAt: 1 } });
        if (!guest) throw new Error('Không tìm thấy guest account ACTIVE!');
        const createdBy = guest._id.toHexString();
        console.log(`[+] Guest: ${guest.fullname} (${createdBy})`);

        // ── 2. CLEAR ALL DATA ──
        console.log('\n[2] Clearing all existing data...');
        await db.collection('brands').deleteMany({});
        await db.collection('products').deleteMany({});
        await db.collection('productvariants').deleteMany({});
        await db.collection('productattributes').deleteMany({});
        await db.collection('productattributevalues').deleteMany({});
        await db.collection('productattributeallowvalues').deleteMany({});
        await db.collection('productviews').deleteMany({});
        console.log('[+] All collections cleared');

        // ── 3. Create Brands ──
        console.log('\n[3] Creating Brands...');
        const brands = BRANDS_DATA.map(b => buildBrand(b));
        const brandMap = new Map();
        for (const b of brands) { brandMap.set(b.name, b); }
        await db.collection('brands').insertMany(brands);
        console.log(`[+] Created ${brands.length} brands`);

        // ── 4. Get categories ──
        console.log('\n[4] Getting categories...');
        const allCategories = await db.collection('categories').find({ isDeleted: { $ne: true } }).toArray();
        console.log(`[+] ${allCategories.length} categories in DB`);
        const categoryBySlug = new Map();
        for (const cat of allCategories) { categoryBySlug.set(cat.slug, cat); }

        // ── 5. Create attributes ──
        console.log('\n[5] Creating ProductAttributes...');
        const attrDefs = [
            { name: 'RAM', displayType: 'BUTTON' },
            { name: 'Ổ cứng SSD', displayType: 'BUTTON' },
            { name: 'CPU', displayType: 'BUTTON' },
            { name: 'VGA', displayType: 'BUTTON' },
        ];
        const attributes = attrDefs.map(a => buildProductAttribute(a.name, a.displayType, createdBy));
        const attrMap = new Map();
        for (const a of attributes) { attrMap.set(a.name, a); }
        await db.collection('productattributes').insertMany(attributes);
        console.log(`[+] Created ${attributes.length} attributes`);

        // ── 6. Scrape products ──
        const allProducts = [];
        const allVariants = [];
        const allAttrValues = [];
        const allAllowValues = [];
        const attrValueCache = new Map();
        const scrapedUrls = new Set();

        // ── 6a. pcmarket.vn ──
        console.log('\n[6a] Scraping pcmarket.vn...');
        for (const catPage of PCM_CATEGORY_PAGES) {
            let categoryId = null;
            const cat = categoryBySlug.get(catPage.categorySlug);
            if (cat) {
                categoryId = cat._id.toHexString();
                console.log(`\n── Category: ${cat.name} ──`);
            } else {
                console.log(`\n── Category: ${catPage.categorySlug} (not in DB) ──`);
            }

            let listItems = [];
            try {
                listItems = await scrapeListPage(catPage.url);
            } catch (err) {
                console.log(`[!] Failed to scrape list: ${err.message}`);
            }
            await delay(REQUEST_DELAY);

            for (const item of listItems) {
                if (scrapedUrls.has(item.detailUrl)) continue;
                scrapedUrls.add(item.detailUrl);

                const detail = await scrapeProductDetail(item.detailUrl);
                await delay(REQUEST_DELAY);
                if (!detail) continue;

                const brand = detectBrand(item.name, brandMap, 'PCM');
                const brandId = brand ? brand._id.toHexString() : null;

                // Parse variant options → attribute values + dimensions
                const variantDimensions = [];
                for (const opt of detail.variantOptions) {
                    let attrDoc = attrMap.get(opt.label);
                    if (!attrDoc) {
                        attrDoc = buildProductAttribute(opt.label, 'BUTTON', createdBy);
                        attrMap.set(opt.label, attrDoc);
                        attributes.push(attrDoc);
                    }
                    const dimension = { attrDoc, values: [] };
                    for (const valText of opt.values) {
                        const cacheKey = `${attrDoc.name}::${valText}`;
                        let attrValueDoc = attrValueCache.get(cacheKey);
                        if (!attrValueDoc) {
                            attrValueDoc = buildProductAttributeValue(valText, valText, attrDoc._id.toHexString(), createdBy);
                            attrValueCache.set(cacheKey, attrValueDoc);
                            allAttrValues.push(attrValueDoc);
                        }
                        dimension.values.push(attrValueDoc);
                    }
                    variantDimensions.push(dimension);
                }

                const basePrice = detail.salePrice || item.salePrice;
                const originalPrice = detail.marketPrice || item.marketPrice || basePrice;
                const discount = item.discountPercent || 0;

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

                // AllowValues
                for (const dim of variantDimensions) {
                    for (const attrVal of dim.values) {
                        allAllowValues.push(buildProductAttributeAllowValue(product._id.toHexString(), attrVal._id.toHexString()));
                    }
                }

                // Variants
                const variants = generateVariants(product, variantDimensions, {
                    basePrice: originalPrice,
                    discount,
                    images: detail.images,
                    specs: detail.specs,
                });

                if (variants.length === 0) {
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

                product.defaultProductVariantId = variants[0]._id;
                product.totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

                // Update minPrice/maxPrice from actual variants
                const prices = variants.map(v => v.price);
                product.minPrice = Math.min(...prices);
                product.maxPrice = Math.max(...prices);

                allProducts.push(product);
                allVariants.push(...variants);
                console.log(`  [✓] ${product.name} → ${variants.length} variants`);
            }
        }

        // ── 6b. gearvn.com ──
        console.log('\n[6b] Scraping gearvn.com (Shopify JSON API)...');

        for (const col of GEARVN_COLLECTIONS) {
            let categoryId = null;
            const cat = categoryBySlug.get(col.categorySlug);
            if (cat) categoryId = cat._id.toHexString();
            console.log(`\n── GVN Collection: ${col.handle} → ${col.categorySlug} ──`);

            let gvnProducts = [];
            try {
                gvnProducts = await scrapeGearVNCollection(col.handle, MAX_PRODUCTS_PER_CATEGORY);
            } catch (err) {
                console.log(`[!] Failed: ${err.message}`);
            }
            await delay(REQUEST_DELAY);

            for (const gvnP of gvnProducts) {
                const productKey = `gearvn::${gvnP.handle}`;
                if (scrapedUrls.has(productKey)) continue;
                scrapedUrls.add(productKey);

                const brand = detectBrand(gvnP.name, brandMap, col.brandDefault);
                const brandId = brand ? brand._id.toHexString() : null;

                const prices = gvnP.shopifyVariants.map(v => parsePrice(v.price || '0')).filter(p => p > 0);
                const marketPrices = gvnP.shopifyVariants.map(v => parsePrice(v.compare_at_price || v.price || '0')).filter(p => p > 0);

                const minPrice = prices.length > 0 ? Math.min(...prices) : gvnP.salePrice;
                const maxPrice = marketPrices.length > 0 ? Math.max(...marketPrices) : gvnP.marketPrice;

                // Clean description HTML — remove Shopify-specific stuff
                let cleanDesc = cleanDescription(gvnP.description || '');

                const product = buildProduct({
                    name: gvnP.name,
                    description: cleanDesc,
                    brandId,
                    categoryId,
                    minPrice: minPrice || gvnP.salePrice,
                    maxPrice: maxPrice || gvnP.marketPrice || gvnP.salePrice,
                    totalStock: 0,
                    createdBy,
                });

                // Try Shopify variants
                const shopifyVars = generateShopifyVariants(
                    product, gvnP, attrMap, attrValueCache,
                    allAttrValues, allAllowValues, createdBy
                );

                let variants;
                if (shopifyVars.length > 0) {
                    variants = shopifyVars;
                } else {
                    // Default single variant
                    const sv = gvnP.shopifyVariants[0];
                    const price = parsePrice(sv?.price || '0') || gvnP.salePrice;
                    const compareAt = parsePrice(sv?.compare_at_price || '0');
                    let disc = 0;
                    if (compareAt > price) disc = Math.round((1 - price / compareAt) * 100);

                    variants = [buildProductVariant({
                        sku: sv?.sku || `GVN-${product.slug.substring(0, 30).toUpperCase().replace(/-/g, '_')}-001`,
                        subDescription: gvnP.productType || '',
                        productId: product._id.toHexString(),
                        price: compareAt > 0 ? compareAt : price,
                        stock: Math.floor(Math.random() * 50) + 5,
                        discount: disc,
                        combination: {},
                        images: gvnP.images,
                    })];
                }

                product.defaultProductVariantId = variants[0]._id;
                product.totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

                const varPrices = variants.map(v => v.price);
                product.minPrice = Math.min(...varPrices);
                product.maxPrice = Math.max(...varPrices);

                allProducts.push(product);
                allVariants.push(...variants);
                console.log(`  [✓] ${product.name} → ${variants.length} variants, brand: ${brand?.name || 'N/A'}`);
            }
        }

        // ── 7. Insert new attributes (if any were created dynamically) ──
        const existingAttrIds = new Set(attrDefs.map(a => a.name));
        const newAttrs = attributes.filter(a => !existingAttrIds.has(a.name));
        if (newAttrs.length > 0) {
            await db.collection('productattributes').insertMany(newAttrs, { ordered: false }).catch(() => { });
        }

        // ── 8. Bulk insert ──
        console.log('\n[7] Inserting into MongoDB...');

        if (allAttrValues.length > 0) {
            await db.collection('productattributevalues').insertMany(allAttrValues, { ordered: false }).catch(e => console.log(`[!] AttrValues: some skipped`));
            console.log(`[+] ${allAttrValues.length} attribute values`);
        }
        if (allProducts.length > 0) {
            await db.collection('products').insertMany(allProducts, { ordered: false }).catch(e => console.log(`[!] Products: some skipped`));
            console.log(`[+] ${allProducts.length} products`);
        }
        if (allVariants.length > 0) {
            await db.collection('productvariants').insertMany(allVariants, { ordered: false }).catch(e => console.log(`[!] Variants: some skipped`));
            console.log(`[+] ${allVariants.length} variants`);
        }
        if (allAllowValues.length > 0) {
            await db.collection('productattributeallowvalues').insertMany(allAllowValues, { ordered: false }).catch(e => console.log(`[!] AllowValues: some skipped`));
            console.log(`[+] ${allAllowValues.length} allow values`);
        }

        // ── 9. Summary ──
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

        // ── 10. Verify combination format ──
        console.log('\n[VERIFY] Sample variant combinations:');
        const sampleVariants = allVariants.filter(v => Object.keys(v.combination).length > 0).slice(0, 5);
        for (const sv of sampleVariants) {
            console.log(`  SKU: ${sv.sku}`);
            console.log(`  combination: ${JSON.stringify(sv.combination)}`);
            console.log(`  price: ${sv.price.toLocaleString()}đ`);
            console.log('  ---');
        }

    } finally {
        await client.close();
        console.log('\n[*] Done.');
    }
}

main().catch(err => {
    console.error('[FATAL]', err);
    process.exit(1);
});
