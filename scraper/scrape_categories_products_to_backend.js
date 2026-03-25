
require("dotenv").config();
const axios = require('axios');
const cheerio = require('cheerio');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('bson');
const { MongoClient } = require('mongodb');

const CONFIG = {
    backendBaseUrl: process.env.BACKEND_BASE_URL || 'http://localhost:8080/api/v1',
    aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    elasticsearchUrl: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    clearElasticBeforeInsert: process.env.CLEAR_ELASTIC_BEFORE_INSERT !== 'false',
    elasticDeleteAll: process.env.ELASTIC_DELETE_ALL !== 'false',
    elasticIndex: process.env.ELASTIC_INDEX || 'product_variants',
    adminToken: process.env.ADMIN_BEARER_TOKEN || '',
    adminIDEmp: process.env.ADMIN_IDEMP || '',
    adminPassword: process.env.ADMIN_PASSWORD || '',
    mongoUri:
        process.env.MONGODB_URI ||
        process.env.MONGO_URI ||
        process.env.MONGODB_URL ||
        '',
    mongoDbName:
        process.env.MONGO_DB_NAME ||
        process.env.MONGODB_DB_NAME ||
        'project-pc-hoang-ha',
    clearMongoBeforeInsert: process.env.CLEAR_MONGO_BEFORE_INSERT === 'true',
    triggerAiReindex: process.env.TRIGGER_AI_REINDEX !== 'false',
    defaultCreatedBy: process.env.DEFAULT_CREATED_BY || '69b4f7065ceddbcaa9a1cba3',
    maxProductsPerCategory: Number(process.env.MAX_PRODUCTS_PER_CATEGORY || 20),
    maxSyntheticVariants: Number(process.env.MAX_SYNTHETIC_VARIANTS || 18),
    targetProductCount: Number(process.env.TARGET_PRODUCT_COUNT || 6000),
    syntheticTopUp: process.env.SYNTHETIC_TOPUP === 'true',
    topUpVariantCap: Number(process.env.TOPUP_VARIANT_CAP || 8),
    includeSyntheticSources: process.env.INCLUDE_SYNTHETIC_SOURCES === 'true',
    requestDelayMs: Number(process.env.REQUEST_DELAY_MS || 700),
    outputReport: path.join(__dirname, 'scrape_import_report.json'),
};

const HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
};

const PCMARKET_CATEGORY_PAGES = [
    { url: '/may-tinh-choi-game-pcm.html', category: 'PC Gaming' },
    { url: '/pc-core-ultra', category: 'PC Gaming' },
    { url: '/pc-gaming-ddr5', category: 'PC Gaming' },
    { url: '/pc-workstation-3d.html', category: 'PC Workstation' },
    { url: '/linh-kien-may-tinh.html', category: 'Linh kiện máy tính' },
    { url: '/man-hinh-may-tinh.html', category: 'Màn hình Gaming' },
    { url: '/gaming-gear.html', category: 'Gaming Gear' },
    { url: '/loa-mic-webcam.html', category: 'Thiết bị ngoại vi' },
];

const GEARVN_COLLECTIONS = [
    // === PC ===
    { handle: 'pc-van-phong', category: 'PC Văn phòng' },
    // === Laptop ===
    { handle: 'laptop-gaming-ban-chay', category: 'Laptop Gaming' },
    { handle: 'laptop-msi', category: 'Laptop Gaming' },
    { handle: 'laptop-asus', category: 'Laptop Gaming' },
    { handle: 'laptop-van-phong-ban-chay', category: 'Laptop Văn phòng' },
    { handle: 'laptop-hp', category: 'Laptop Văn phòng' },
    { handle: 'laptop-lenovo', category: 'Laptop Văn phòng' },
    { handle: 'laptop-acer', category: 'Laptop Văn phòng' },
    { handle: 'laptop-do-hoa-ky-thuat', category: 'Laptop Đồ họa' },
    { handle: 'laptop-dell', category: 'Laptop Đồ họa' },
    // === Linh kiện ===
    { handle: 'cpu-bo-vi-xu-ly', category: 'CPU - Bộ vi xử lý' },
    { handle: 'vga-card-man-hinh', category: 'VGA - Card đồ họa' },
    { handle: 'mainboard-bo-mach-chu', category: 'Mainboard' },
    { handle: 'ram-pc', category: 'RAM' },
    { handle: 'psu-nguon-may-tinh', category: 'Nguồn máy tính' },
    { handle: 'tan-nhiet-khi', category: 'Tản nhiệt' },
    { handle: 'tan-nhiet-nuoc', category: 'Tản nhiệt' },
    // === Màn hình ===
    { handle: 'man-hinh-gaming', category: 'Màn hình Gaming' },
    { handle: 'man-hinh-27-inch', category: 'Màn hình Văn phòng' },
    { handle: 'man-hinh-do-hoa', category: 'Màn hình Đồ họa' },
    // === Gaming Gear ===
    { handle: 'ban-phim-co', category: 'Bàn phím Gaming' },
    { handle: 'chuot-may-tinh', category: 'Chuột Gaming' },
    { handle: 'tai-nghe-may-tinh', category: 'Tai nghe Gaming' },
    { handle: 'tai-nghe-over-ear', category: 'Tai nghe Gaming' },
    { handle: 'ghe-gaming', category: 'Ghế Gaming' },
    // === Thiết bị ngoại vi ===
    { handle: 'loa', category: 'Loa máy tính' },
    { handle: 'microphone', category: 'Microphone' },
    { handle: 'webcam', category: 'Webcam' },
    { handle: 'phu-kien-may-tinh', category: 'Phụ kiện PC' },
    { handle: 'de-tan-nhiet-laptop', category: 'Phụ kiện PC' },
    { handle: 'ban-nang-ha', category: 'Phụ kiện PC' },
];

const CELLPHONES_LISTING_PAGES = [
    { url: 'https://cellphones.com.vn/laptop.html', category: 'Laptop Gaming' },
    { url: 'https://cellphones.com.vn/laptop-gaming.html', category: 'Laptop Gaming' },
    { url: 'https://cellphones.com.vn/man-hinh.html', category: 'Màn hình Gaming' },
    { url: 'https://cellphones.com.vn/tai-nghe.html', category: 'Tai nghe Gaming' },
    { url: 'https://cellphones.com.vn/loa.html', category: 'Loa máy tính' },
    { url: 'https://cellphones.com.vn/chuot-ban-phim.html', category: 'Bàn phím Gaming' },
];

const HOANGHA_LISTING_PAGES = [
    {
        url: 'https://www.hoanghamobile.com/laptop',
        category: 'Laptop Văn phòng',
        productPathMatch: '/laptop/',
    },
    {
        url: 'https://www.hoanghamobile.com/man-hinh-may-tinh',
        category: 'Màn hình Văn phòng',
        productPathMatch: '/man-hinh/',
    },
];

const DUMMYJSON_CATEGORIES = [];

const ESCUELA_CATEGORY_HINTS = [];

const CATEGORY_TREE = [
    // === ROOT 1: Máy tính để bàn (3 con) ===
    { name: 'Máy tính để bàn', parent: null },
    { name: 'PC Gaming', parent: 'Máy tính để bàn' },
    { name: 'PC Văn phòng', parent: 'Máy tính để bàn' },
    { name: 'PC Workstation', parent: 'Máy tính để bàn' },

    // === ROOT 2: Laptop (3 con) ===
    { name: 'Laptop', parent: null },
    { name: 'Laptop Gaming', parent: 'Laptop' },
    { name: 'Laptop Văn phòng', parent: 'Laptop' },
    { name: 'Laptop Đồ họa', parent: 'Laptop' },

    // === ROOT 3: Linh kiện máy tính (8 con) ===
    { name: 'Linh kiện máy tính', parent: null },
    { name: 'CPU - Bộ vi xử lý', parent: 'Linh kiện máy tính' },
    { name: 'VGA - Card đồ họa', parent: 'Linh kiện máy tính' },
    { name: 'Mainboard', parent: 'Linh kiện máy tính' },
    { name: 'RAM', parent: 'Linh kiện máy tính' },
    { name: 'Ổ cứng SSD', parent: 'Linh kiện máy tính' },
    { name: 'Nguồn máy tính', parent: 'Linh kiện máy tính' },
    { name: 'Vỏ Case', parent: 'Linh kiện máy tính' },
    { name: 'Tản nhiệt', parent: 'Linh kiện máy tính' },

    // === ROOT 4: Màn hình (3 con) ===
    { name: 'Màn hình', parent: null },
    { name: 'Màn hình Gaming', parent: 'Màn hình' },
    { name: 'Màn hình Văn phòng', parent: 'Màn hình' },
    { name: 'Màn hình Đồ họa', parent: 'Màn hình' },

    // === ROOT 5: Gaming Gear (5 con) ===
    { name: 'Gaming Gear', parent: null },
    { name: 'Bàn phím Gaming', parent: 'Gaming Gear' },
    { name: 'Chuột Gaming', parent: 'Gaming Gear' },
    { name: 'Tai nghe Gaming', parent: 'Gaming Gear' },
    { name: 'Ghế Gaming', parent: 'Gaming Gear' },
    { name: 'Bàn di chuột', parent: 'Gaming Gear' },

    // === ROOT 6: Thiết bị ngoại vi (4 con) ===
    { name: 'Thiết bị ngoại vi', parent: null },
    { name: 'Loa máy tính', parent: 'Thiết bị ngoại vi' },
    { name: 'Microphone', parent: 'Thiết bị ngoại vi' },
    { name: 'Webcam', parent: 'Thiết bị ngoại vi' },
    { name: 'Phụ kiện PC', parent: 'Thiết bị ngoại vi' },
];

const CATEGORY_ALIAS_MAP = {
    // Gaming Gear
    'gaming-gear': 'Gaming Gear',
    'gear-gaming': 'Gaming Gear',
    // Tai nghe
    'headphone': 'Tai nghe Gaming',
    'tai-nghe': 'Tai nghe Gaming',
    'tai-nghe-gaming': 'Tai nghe Gaming',
    'headset': 'Tai nghe Gaming',
    // Chuột
    'chuot': 'Chuột Gaming',
    'mouse': 'Chuột Gaming',
    'chuot-gaming': 'Chuột Gaming',
    // Bàn phím
    'ban-phim': 'Bàn phím Gaming',
    'keyboard': 'Bàn phím Gaming',
    'ban-phim-gaming': 'Bàn phím Gaming',
    'ban-phim-co': 'Bàn phím Gaming',
    // Màn hình
    'monitor': 'Màn hình Gaming',
    'man-hinh': 'Màn hình Gaming',
    'man-hinh-may-tinh': 'Màn hình Gaming',
    'display': 'Màn hình Gaming',
    'man-hinh-gaming': 'Màn hình Gaming',
    'man-hinh-van-phong': 'Màn hình Văn phòng',
    'man-hinh-do-hoa': 'Màn hình Đồ họa',
    // Laptop
    'laptop-gaming': 'Laptop Gaming',
    'laptop-van-phong': 'Laptop Văn phòng',
    'laptop-do-hoa': 'Laptop Đồ họa',
    laptop: 'Laptop',
    // PC
    pc: 'PC Gaming',
    'pc-gaming': 'PC Gaming',
    'pc-van-phong': 'PC Văn phòng',
    'pc-workstation': 'PC Workstation',
    'may-tinh-de-ban': 'Máy tính để bàn',
    // Linh kiện
    'linh-kien': 'Linh kiện máy tính',
    'linh-kien-pc': 'Linh kiện máy tính',
    'linh-kien-may-tinh': 'Linh kiện máy tính',
    cpu: 'CPU - Bộ vi xử lý',
    'bo-vi-xu-ly': 'CPU - Bộ vi xử lý',
    vga: 'VGA - Card đồ họa',
    'card-do-hoa': 'VGA - Card đồ họa',
    'card-man-hinh': 'VGA - Card đồ họa',
    mainboard: 'Mainboard',
    'bo-mach-chu': 'Mainboard',
    ram: 'RAM',
    ssd: 'Ổ cứng SSD',
    'o-cung': 'Ổ cứng SSD',
    'o-cung-ssd': 'Ổ cứng SSD',
    'nguon-may-tinh': 'Nguồn máy tính',
    psu: 'Nguồn máy tính',
    'nguon-psu': 'Nguồn máy tính',
    'case': 'Vỏ Case',
    'vo-case': 'Vỏ Case',
    'vo-may-tinh': 'Vỏ Case',
    'tan-nhiet': 'Tản nhiệt',
    'cooler': 'Tản nhiệt',
    // Ghế Gaming
    'ghe-gaming': 'Ghế Gaming',
    'ban-di-chuot': 'Bàn di chuột',
    mousepad: 'Bàn di chuột',
    // Thiết bị ngoại vi
    'loa': 'Loa máy tính',
    'loa-may-tinh': 'Loa máy tính',
    'speaker': 'Loa máy tính',
    'audio': 'Loa máy tính',
    'sound': 'Loa máy tính',
    'microphone': 'Microphone',
    'micro': 'Microphone',
    'mic': 'Microphone',
    'webcam': 'Webcam',
    'phu-kien': 'Phụ kiện PC',
    'phu-kien-pc': 'Phụ kiện PC',
};

const DEFAULT_CREATED_BY_OBJECT_ID = toObjectIdStrict(CONFIG.defaultCreatedBy, 'DEFAULT_CREATED_BY');

function toObjectIdStrict(value, label) {
    if (value instanceof ObjectId) return value;
    if (!ObjectId.isValid(value)) {
        throw new Error(`${label} is not a valid ObjectId: ${value}`);
    }
    return new ObjectId(String(value));
}

function toObjectIdHex(value, label) {
    return toObjectIdStrict(value, label).toHexString();
}

function objectIdEquals(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return toObjectIdHex(a, 'objectId.a') === toObjectIdHex(b, 'objectId.b');
}

function createUniqueSlug(baseSlug, usedSet) {
    const base = baseSlug || 'item';
    let slug = base;
    let idx = 1;
    while (usedSet.has(slug)) {
        slug = `${base}-${idx}`;
        idx += 1;
    }
    usedSet.add(slug);
    return slug;
}

function hashString(input) {
    const text = String(input || '');
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function seededUnit(seedValue) {
    return (hashString(seedValue) % 10000) / 10000;
}

function roundPrice(value) {
    return Math.round(Math.max(100000, value) / 1000) * 1000;
}

function combinationSignature(combination) {
    if (!combination || typeof combination !== 'object') return '';
    return Object.keys(combination)
        .sort()
        .map((k) => `${k}:${combination[k]}`)
        .join('|');
}

function diversifyVariantPrices(variants, productName, fallbackBasePrice) {
    if (!Array.isArray(variants) || variants.length <= 1) return Array.isArray(variants) ? variants : [];

    const prepared = variants.map((v, i) => {
        const originalPrice = Number(v?.price) || Number(fallbackBasePrice) || 100000;
        const signature = combinationSignature(v?.combination);
        return {
            ...v,
            _idx: i,
            _signature: signature,
            _price: Math.max(100000, originalPrice),
        };
    });

    const prices = prepared.map((x) => x._price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const distinctCount = new Set(prices.map((x) => roundPrice(x))).size;
    const spreadRatio = minPrice > 0 ? (maxPrice - minPrice) / minPrice : 0;

    if (distinctCount >= 2 && spreadRatio >= 0.015) {
        return prepared.map(({ _idx, _signature, _price, ...rest }) => rest);
    }

    const base = Number(fallbackBasePrice) > 0 ? Number(fallbackBasePrice) : minPrice;

    const diversified = prepared.map((v) => {
        const seed = `${productName}|${v._idx}|${v._signature || 'na'}`;
        const rand = seededUnit(seed);
        const centered = (rand - 0.5) * 0.18;

        const sigHash = hashString(v._signature || `${v._idx}`);
        const rankBoost = ((sigHash % 7) - 3) * 0.012;

        const candidate = roundPrice(base * (1 + centered + rankBoost));
        return {
            ...v,
            _price: Math.max(100000, candidate),
        };
    });

    diversified.sort((a, b) => a._price - b._price || a._idx - b._idx);

    for (let i = 1; i < diversified.length; i += 1) {
        if (diversified[i]._price <= diversified[i - 1]._price) {
            diversified[i]._price = roundPrice(diversified[i - 1]._price * 1.012);
        }
    }

    return diversified
        .sort((a, b) => a._idx - b._idx)
        .map(({ _idx, _signature, _price, ...rest }) => ({
            ...rest,
            price: _price,
        }));
}

function extractNumericValue(text) {
    const m = String(text || '').match(/\d+(?:\.\d+)?/);
    return m ? Number(m[0]) : null;
}

function normalizeProductName(name) {
    return String(name || '')
        .replace(/\[[^\]]*auto[^\]]*\]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function isReasonableProductName(name) {
    const n = String(name || '').trim();
    if (!n || n.length < 8) return false;

    const normalized = makeSlug(n);
    if (!normalized) return false;

    const badTokens = ['banner', 'khuyen-mai', 'flash-sale', 'ads', 'quang-cao', 'voucher'];
    if (badTokens.some((x) => normalized.includes(x))) return false;

    return true;
}

function isLikelyProductImage(url) {
    const u = String(url || '').toLowerCase();
    if (!u) return false;

    const blocked = ['banner', 'ads', 'promo', 'khuyen-mai', 'icon', 'logo'];
    if (blocked.some((x) => u.includes(x))) return false;

    return /\.(jpg|jpeg|png|webp)(\?|$)/.test(u) || u.includes('/media/product') || u.includes('/product/');
}

function buildSyntheticName(baseName, seed) {
    const cleanedBase = normalizeProductName(baseName) || 'San pham';
    const adjectives = ['Edition', 'Series', 'Version', 'Config', 'Model'];
    const noun = adjectives[seed % adjectives.length];
    const code = String(100 + (seed % 900));
    return `${cleanedBase} ${noun} ${code}`;
}

function computeDimensionImportance(label) {
    const key = makeSlug(label);
    if (!key) return 0.08;
    if (key.includes('cpu') || key.includes('vga') || key.includes('gpu')) return 0.2;
    if (key.includes('ram') || key.includes('bo-nho') || key.includes('ssd')) return 0.14;
    if (key.includes('tan-so-quet') || key.includes('do-phan-giai')) return 0.12;
    if (key.includes('kich-thuoc')) return 0.08;
    if (key.includes('mau-sac')) return 0.02;
    return 0.09;
}

function computeValueScore(value, index, total) {
    const numeric = extractNumericValue(value);
    if (numeric !== null && Number.isFinite(numeric)) {
        return numeric;
    }
    const rank = total > 1 ? index / (total - 1) : 0.5;
    return rank * 100;
}

function randomSkuSuffix(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < length; i += 1) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
}

function sanitizeSkuBase(text) {
    const raw = String(text || '')
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return raw || 'SKU';
}

function makeUniqueSku(preferredSku, productName, variantIndex, usedSkus) {
    const baseFromSku = sanitizeSkuBase(preferredSku);
    const baseFromName = sanitizeSkuBase(makeSlug(productName).substring(0, 18));
    const base = baseFromSku !== 'SKU' ? baseFromSku : `${baseFromName}-${String(variantIndex + 1).padStart(3, '0')}`;

    if (!usedSkus.has(base)) {
        usedSkus.add(base);
        return base;
    }

    let next = `${base}-${randomSkuSuffix()}`;
    while (usedSkus.has(next)) {
        next = `${base}-${randomSkuSuffix()}`;
    }
    usedSkus.add(next);
    return next;
}

function cloneVariantWithSeed(variant, seed, productName) {
    const suffix = String(seed).padStart(5, '0');
    const randomBias = (seededUnit(`${productName}-${seed}-price`) - 0.5) * 0.12;
    const baseMultiplier = 1 + randomBias;
    const next = {
        ...variant,
        sku: `${makeSlug(productName).substring(0, 14).toUpperCase()}-${suffix}`,
        price: roundPrice((variant.price || 100000) * baseMultiplier),
        stock: Math.max(1, (variant.stock || 10) + (seed % 17)),
        discount: Math.min(35, Math.max(0, (variant.discount || 0) + Math.round(seededUnit(`${seed}-disc`) * 8))),
        combination: {
            ...(variant.combination || {}),
            'phien-ban': `batch-${suffix}`,
        },
    };
    return next;
}

function expandProductsToTarget(products, targetCount) {
    if (!CONFIG.syntheticTopUp) return products;
    if (!Number.isFinite(targetCount) || targetCount <= 0) return products;
    if (products.length >= targetCount) return products;
    if (products.length === 0) return products;

    const output = [...products];
    let seed = 1;
    while (output.length < targetCount) {
        const base = products[seed % products.length];
        const cloneIdx = output.length + 1;
        const newName = buildSyntheticName(base.name, cloneIdx + seed);
        const baseVariants = Array.isArray(base.variants) && base.variants.length
            ? base.variants
            : generateSyntheticVariants(base, base.basePrice || 100000);
        const variantCap = Math.max(1, CONFIG.topUpVariantCap);
        const trimmedBaseVariants = baseVariants.slice(0, variantCap);

        const clonedVariants = trimmedBaseVariants.map((v, i) =>
            cloneVariantWithSeed(v, seed * 100 + i + 1, newName),
        );

        output.push({
            ...base,
            source: `${base.source}-topup`,
            sourceUrl: base.sourceUrl || '',
            name: newName,
            basePrice: roundPrice((base.basePrice || 100000) * (0.92 + seededUnit(`${newName}-base`) * 0.26)),
            variants: clonedVariants,
        });

        seed += 1;
    }

    return output;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePrice(text) {
    if (!text) return 0;
    const cleaned = String(text).replace(/[^\d]/g, '');
    return Number.parseInt(cleaned, 10) || 0;
}

function makeSlug(text) {
    return slugify(text || '', { lower: true, strict: true, locale: 'vi' });
}

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function extractDescriptionHtmlFromCheerio($, selectors, fallbackText = '', fallbackTitle = '') {
    const candidates = [];

    for (const selector of selectors || []) {
        $(selector).each((_, el) => {
            const html = ($(el).html() || '').trim();
            if (html && html.length > 40) {
                candidates.push(`<div>${html}</div>`);
            }
        });
    }

    if (fallbackText) {
        candidates.push(`<p>${escapeHtml(fallbackText)}</p>`);
    }

    const bodyHtml = ($('body').html() || '').trim();
    if (bodyHtml && bodyHtml.length > 120) {
        candidates.push(`<article>${bodyHtml}</article>`);
    }

    const best = candidates.sort((a, b) => b.length - a.length)[0];
    if (best) return best;

    return `<p>${escapeHtml(fallbackTitle || 'Không có mô tả')}</p>`;
}

function toTitleCase(text) {
    return String(text || '')
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

function normalizeAttributeValue(value) {
    return makeSlug(String(value || ''));
}

function buildAttributeName(rawKey) {
    const cleaned = String(rawKey || '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!cleaned) return 'Thuoc tinh';
    return toTitleCase(cleaned);
}

function inferDisplayType(attributeCode) {
    const code = String(attributeCode || '');
    if (code.includes('mau') || code.includes('color')) return 'COLOR';
    if (code.includes('hinh') || code.includes('image')) return 'IMAGE';
    return 'BUTTON';
}

function inferColorHex(attributeCode, attributeValue) {
    const code = String(attributeCode || '');
    if (!code.includes('mau') && !code.includes('color')) return '';

    const key = normalizeAttributeValue(attributeValue);
    const map = {
        den: '#111111',
        trang: '#FFFFFF',
        xam: '#9CA3AF',
        bac: '#C0C0C0',
        xanh: '#2563EB',
        'xanh-la': '#16A34A',
        do: '#DC2626',
        hong: '#EC4899',
        vang: '#F59E0B',
        tim: '#7C3AED',
    };
    return map[key] || '';
}

const BRAND_PATTERNS = [
    // CPU / Chip
    { pattern: /\bIntel\b/i, name: 'Intel', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/200px-Intel_logo_%282006-2020%29.svg.png' },
    { pattern: /\bAMD\b/i, name: 'AMD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/200px-AMD_Logo.svg.png' },
    { pattern: /\bNVIDIA\b/i, name: 'NVIDIA', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/NVIDIA_logo.svg/200px-NVIDIA_logo.svg.png' },
    // PC / Laptop / Monitor brands
    { pattern: /\bASUS\b|\bROG\b/i, name: 'ASUS', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/200px-ASUS_Logo.svg.png' },
    { pattern: /\bMSI\b/i, name: 'MSI', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/MSI_Logo.svg/200px-MSI_Logo.svg.png' },
    { pattern: /\bGigabyte\b|\bAORUS\b/i, name: 'Gigabyte', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Gigabyte_logo.svg/200px-Gigabyte_logo.svg.png' },
    { pattern: /\bASRock\b/i, name: 'ASRock' },
    { pattern: /\bDell\b|\bAlienware\b/i, name: 'Dell' },
    { pattern: /\bHP\b|\bOmen\b/i, name: 'HP' },
    { pattern: /\bLenovo\b|\bLegion\b|\bThinkPad\b/i, name: 'Lenovo' },
    { pattern: /\bAcer\b|\bPredator\b|\bNitro\b/i, name: 'Acer' },
    { pattern: /\bSamsung\b/i, name: 'Samsung' },
    { pattern: /\bLG\b/i, name: 'LG' },
    { pattern: /\bBenQ\b|\bZOWIE\b/i, name: 'BenQ' },
    { pattern: /\bViewSonic\b/i, name: 'ViewSonic' },
    // Storage
    { pattern: /\bKingston\b/i, name: 'Kingston' },
    { pattern: /\bCorsair\b/i, name: 'Corsair' },
    { pattern: /\bG\.?Skill\b/i, name: 'G.Skill' },
    { pattern: /\bCrucial\b|\bMicron\b/i, name: 'Crucial' },
    { pattern: /\bWestern Digital\b|\bWD\b/i, name: 'Western Digital' },
    { pattern: /\bSeagate\b/i, name: 'Seagate' },
    // PSU / Case / Cooling
    { pattern: /\bSeasonic\b/i, name: 'Seasonic' },
    { pattern: /\bNZXT\b/i, name: 'NZXT' },
    { pattern: /\bCooler Master\b/i, name: 'Cooler Master' },
    { pattern: /\bLian Li\b/i, name: 'Lian Li' },
    { pattern: /\bDeepCool\b/i, name: 'DeepCool' },
    { pattern: /\bbe quiet!\b|\bBe Quiet\b/i, name: 'be quiet!' },
    { pattern: /\bThermaltake\b/i, name: 'Thermaltake' },
    { pattern: /\bJonsbo\b/i, name: 'Jonsbo' },
    // Peripherals
    { pattern: /\bRazer\b/i, name: 'Razer' },
    { pattern: /\bLogitech\b/i, name: 'Logitech' },
    { pattern: /\bSteelSeries\b/i, name: 'SteelSeries' },
    { pattern: /\bHyperX\b/i, name: 'HyperX' },
    { pattern: /\bDucky\b/i, name: 'Ducky' },
    { pattern: /\bKeychron\b/i, name: 'Keychron' },
    { pattern: /\bAkko\b/i, name: 'Akko' },
    // Audio
    { pattern: /\bSony\b/i, name: 'Sony' },
    { pattern: /\bJBL\b/i, name: 'JBL' },
    { pattern: /\bEdifier\b/i, name: 'Edifier' },
    // Chairs
    { pattern: /\bE-?Dra\b/i, name: 'E-Dra' },
    { pattern: /\bSecretlab\b/i, name: 'Secretlab' },
    // GPU specific
    { pattern: /\bSPARKLE\b/i, name: 'SPARKLE' },
    { pattern: /\bZotac\b/i, name: 'Zotac' },
    { pattern: /\bEVGA\b/i, name: 'EVGA' },
    { pattern: /\bInno3D\b/i, name: 'Inno3D' },
    { pattern: /\bPalit\b/i, name: 'Palit' },
    { pattern: /\bColorful\b/i, name: 'Colorful' },
    { pattern: /\bGalax\b/i, name: 'Galax' },
    // Others
    { pattern: /\bGVN\b/i, name: 'GVN' },
];

function detectBrand(productName) {
    const name = String(productName || '');
    for (const bp of BRAND_PATTERNS) {
        if (bp.pattern.test(name)) {
            return { name: bp.name, logo: bp.logo || '' };
        }
    }
    return null;
}

function unwrapApi(responseData) {
    if (!responseData) return null;
    if (Object.prototype.hasOwnProperty.call(responseData, 'data')) {
        return responseData.data;
    }
    return responseData;
}

function canonicalCategoryKey(nameOrSlug) {
    if (!nameOrSlug) return '';
    const slug = makeSlug(String(nameOrSlug));
    return slug.replace(/-\d+$/, '');
}

function normalizeCategoryName(rawCategoryName, context = {}) {
    const raw = String(rawCategoryName || '').trim();
    const rawKey = canonicalCategoryKey(raw);

    for (const node of CATEGORY_TREE) {
        if (canonicalCategoryKey(node.name) === rawKey) {
            return node.name;
        }
    }

    if (rawKey && CATEGORY_ALIAS_MAP[rawKey]) {
        return CATEGORY_ALIAS_MAP[rawKey];
    }

    const bucket = makeSlug(`${context.name || ''} ${context.sourceUrl || ''} ${raw}`);
    // Linh kiện chi tiết (check before generic)
    if (bucket.includes('cpu') || bucket.includes('vi-xu-ly') || bucket.includes('processor')) {
        return 'CPU - Bộ vi xử lý';
    }
    if (bucket.includes('vga') || bucket.includes('card-do-hoa') || bucket.includes('card-man-hinh') || bucket.includes('geforce') || bucket.includes('radeon')) {
        return 'VGA - Card đồ họa';
    }
    if (bucket.includes('mainboard') || bucket.includes('bo-mach-chu')) {
        return 'Mainboard';
    }
    if ((bucket.includes('ram') && !bucket.includes('program')) || bucket.includes('bo-nho-trong')) {
        return 'RAM';
    }
    if (bucket.includes('ssd') || bucket.includes('o-cung') || bucket.includes('hdd')) {
        return 'Ổ cứng SSD';
    }
    if (bucket.includes('nguon') || bucket.includes('psu') || bucket.includes('power-supply')) {
        return 'Nguồn máy tính';
    }
    if (bucket.includes('case') || bucket.includes('vo-may-tinh') || bucket.includes('vo-case')) {
        return 'Vỏ Case';
    }
    if (bucket.includes('tan-nhiet') || bucket.includes('cooler') || bucket.includes('quat')) {
        return 'Tản nhiệt';
    }
    // Laptop
    if (bucket.includes('laptop')) {
        if (bucket.includes('gaming') || bucket.includes('rog') || bucket.includes('predator')) return 'Laptop Gaming';
        if (bucket.includes('do-hoa') || bucket.includes('creator') || bucket.includes('proart')) return 'Laptop Đồ họa';
        return 'Laptop Văn phòng';
    }
    // Màn hình
    if (bucket.includes('man-hinh') || bucket.includes('monitor') || bucket.includes('display')) {
        if (bucket.includes('do-hoa') || bucket.includes('proart') || bucket.includes('creator')) return 'Màn hình Đồ họa';
        if (bucket.includes('van-phong') || bucket.includes('office')) return 'Màn hình Văn phòng';
        return 'Màn hình Gaming';
    }
    // Gaming Gear
    if (bucket.includes('tai-nghe') || bucket.includes('headphone') || bucket.includes('headset')) {
        return 'Tai nghe Gaming';
    }
    if (bucket.includes('ban-phim') || bucket.includes('keyboard')) {
        return 'Bàn phím Gaming';
    }
    if (bucket.includes('chuot') || bucket.includes('mouse')) {
        return 'Chuột Gaming';
    }
    if (bucket.includes('ghe-gaming') || bucket.includes('gaming-chair')) {
        return 'Ghế Gaming';
    }
    if (bucket.includes('mousepad') || bucket.includes('ban-di-chuot') || bucket.includes('lot-chuot')) {
        return 'Bàn di chuột';
    }
    // Thiết bị ngoại vi
    if (bucket.includes('loa') || bucket.includes('speaker')) {
        return 'Loa máy tính';
    }
    if (bucket.includes('mic') || bucket.includes('microphone')) {
        return 'Microphone';
    }
    if (bucket.includes('webcam')) {
        return 'Webcam';
    }
    // PC
    if (bucket.includes('linh-kien')) {
        return 'Linh kiện máy tính';
    }
    if (bucket.includes('workstation') || bucket.includes('render')) {
        return 'PC Workstation';
    }
    if (bucket.includes('pc') || bucket.includes('may-tinh')) {
        if (bucket.includes('van-phong') || bucket.includes('office')) return 'PC Văn phòng';
        return 'PC Gaming';
    }

    return 'Phụ kiện PC';
}

function registerCategory(mapByKey, cat) {
    if (!cat) return;
    const slugKey = canonicalCategoryKey(cat.slug || '');
    const nameKey = canonicalCategoryKey(cat.name || '');
    if (slugKey) mapByKey.set(slugKey, cat);
    if (nameKey) mapByKey.set(nameKey, cat);
}

function categoryVariantPreset(categoryName) {
    const c = makeSlug(categoryName);
    if (c.includes('laptop')) {
        return [
            { label: 'CPU', values: ['Core i5', 'Core i7', 'Ryzen 7', 'Core Ultra 5'] },
            { label: 'RAM', values: ['8GB', '16GB', '32GB'] },
            { label: 'SSD', values: ['512GB', '1TB'] },
        ];
    }
    if (c.includes('pc') || c.includes('may-tinh-de-ban') || c.includes('workstation')) {
        return [
            { label: 'CPU', values: ['Core i5', 'Core i7', 'Ryzen 5', 'Ryzen 7'] },
            { label: 'RAM', values: ['16GB', '32GB', '64GB'] },
            { label: 'SSD', values: ['512GB', '1TB', '2TB'] },
            { label: 'VGA', values: ['RTX 4060', 'RTX 4070', 'RTX 5070'] },
        ];
    }
    if (c.includes('man-hinh')) {
        return [
            { label: 'Kich thuoc', values: ['24 inch', '27 inch', '32 inch'] },
            { label: 'Tan so quet', values: ['144Hz', '165Hz', '240Hz'] },
            { label: 'Do phan giai', values: ['FHD', '2K', '4K'] },
        ];
    }
    if (c.includes('cpu') || c.includes('vi-xu-ly')) {
        return [
            { label: 'Dong CPU', values: ['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'] },
            { label: 'The he', values: ['Gen 13', 'Gen 14', 'Gen 15'] },
        ];
    }
    if (c.includes('vga') || c.includes('card-do-hoa')) {
        return [
            { label: 'Chip', values: ['RTX 4060', 'RTX 4070', 'RTX 4080', 'RTX 5070', 'RX 7800 XT'] },
            { label: 'VRAM', values: ['8GB', '12GB', '16GB'] },
        ];
    }
    if (c.includes('mainboard')) {
        return [
            { label: 'Socket', values: ['LGA 1700', 'LGA 1851', 'AM5', 'AM4'] },
            { label: 'Chipset', values: ['B760', 'Z790', 'B650', 'X670'] },
        ];
    }
    if (c === 'ram' || c.includes('ram')) {
        return [
            { label: 'Dung luong', values: ['8GB', '16GB', '32GB'] },
            { label: 'Bus', values: ['DDR4 3200MHz', 'DDR5 5600MHz', 'DDR5 6000MHz'] },
        ];
    }
    if (c.includes('ssd') || c.includes('o-cung')) {
        return [
            { label: 'Dung luong', values: ['256GB', '512GB', '1TB', '2TB'] },
            { label: 'Loai', values: ['NVMe M.2', 'SATA 2.5 inch'] },
        ];
    }
    if (c.includes('nguon') || c.includes('psu')) {
        return [
            { label: 'Cong suat', values: ['550W', '650W', '750W', '850W', '1000W'] },
            { label: 'Chung chi', values: ['80 Plus Bronze', '80 Plus Gold', '80 Plus Platinum'] },
        ];
    }
    if (c.includes('case') || c.includes('vo-case')) {
        return [
            { label: 'Kich thuoc', values: ['Mid Tower', 'Full Tower', 'Mini ITX'] },
            { label: 'Mau sac', values: ['Den', 'Trang'] },
        ];
    }
    if (c.includes('tan-nhiet') || c.includes('cooler')) {
        return [
            { label: 'Loai', values: ['Air Cooler', 'AIO 240mm', 'AIO 360mm'] },
            { label: 'Mau sac', values: ['Den', 'Trang'] },
        ];
    }
    if (c.includes('ban-phim') || c.includes('keyboard')) {
        return [
            { label: 'Ket noi', values: ['Co day', 'Khong day', 'Bluetooth'] },
            { label: 'Switch', values: ['Red', 'Blue', 'Brown'] },
        ];
    }
    if (c.includes('chuot') || c.includes('mouse')) {
        return [
            { label: 'Ket noi', values: ['Co day', 'Khong day'] },
            { label: 'DPI', values: ['8000 DPI', '16000 DPI', '25600 DPI'] },
        ];
    }
    if (c.includes('tai-nghe') || c.includes('headphone')) {
        return [
            { label: 'Ket noi', values: ['Co day', 'Khong day', 'Bluetooth'] },
            { label: 'Loai', values: ['Over-ear', 'In-ear'] },
        ];
    }
    if (c.includes('ghe-gaming')) {
        return [
            { label: 'Chat lieu', values: ['Da PU', 'Vai luoi', 'Da that'] },
            { label: 'Mau sac', values: ['Den', 'Trang', 'Do'] },
        ];
    }
    return [
        { label: 'Phien ban', values: ['Ban tieu chuan', 'Ban nang cao', 'Ban premium'] },
        { label: 'Mau sac', values: ['Den', 'Trang'] },
    ];
}

function cartesianProduct(inputArrays) {
    if (!inputArrays.length) return [[]];
    return inputArrays.reduce(
        (acc, arr) => acc.flatMap((x) => arr.map((y) => [...x, y])),
        [[]],
    );
}

function generateSyntheticVariants(product, basePrice) {
    const dimensions = categoryVariantPreset(product.categoryName);
    const combos = cartesianProduct(dimensions.map((d) => d.values)).slice(0, CONFIG.maxSyntheticVariants);
    const variants = [];

    const dimScales = dimensions.map((d) => {
        const scores = d.values.map((v, i) => computeValueScore(v, i, d.values.length));
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        return {
            label: d.label,
            values: d.values,
            scores,
            min,
            max,
            weight: computeDimensionImportance(d.label),
        };
    });

    for (let i = 0; i < combos.length; i += 1) {
        const combination = {};
        let adjustment = 0;

        for (let j = 0; j < dimensions.length; j += 1) {
            const key = makeSlug(dimensions[j].label) || `option-${j + 1}`;
            combination[key] = combos[i][j];

            const dim = dimScales[j];
            const valueIndex = dim.values.findIndex((x) => x === combos[i][j]);
            const rawScore = valueIndex >= 0 ? dim.scores[valueIndex] : dim.min;
            const normalized = dim.max > dim.min ? (rawScore - dim.min) / (dim.max - dim.min) : 0.5;
            adjustment += (normalized - 0.5) * dim.weight;
        }

        const noise = (seededUnit(`${product.name}-${i}`) - 0.5) * 0.06;
        const tierLift = combos.length > 1 ? (i / (combos.length - 1)) * 0.03 : 0;
        const factor = 1 + adjustment + noise + tierLift;
        const price = roundPrice(basePrice * Math.max(0.65, factor));
        const discount = Math.min(35, Math.max(0, Math.round(seededUnit(`${product.name}-${i}-disc`) * 22)));

        variants.push({
            sku: `${makeSlug(product.name).substring(0, 18).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
            subDescription: `${product.categoryName} - ${Object.values(combination).join(' / ')}`,
            price,
            stock: 8 + i * 3,
            discount,
            combination,
            images: product.images || [],
        });
    }

    return variants;
}

function normalizeImageUrl(url, baseUrl = '') {
    if (!url) return '';
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${baseUrl}${url}`;
    return url;
}

async function scrapePcMarket() {
    const all = [];

    for (const cat of PCMARKET_CATEGORY_PAGES) {
        const listUrl = `https://pcmarket.vn${cat.url}`;
        let html;
        try {
            const res = await axios.get(listUrl, { headers: HEADERS, timeout: 30000 });
            html = res.data;
        } catch (error) {
            console.log(`[PCMarket] Skip ${listUrl}: ${error.message}`);
            continue;
        }

        const $ = cheerio.load(html);
        const items = [];

        $('.product_list .p-item, .product-list-2021 .p-item').each((i, el) => {
            if (i >= CONFIG.maxProductsPerCategory) return;
            const root = $(el);
            const href = root.find('a.p-img').attr('href') || root.find('a').first().attr('href');
            const name = root.find('a.p-name').text().trim() || root.find('.p-name').text().trim();
            const priceText = root.find('.p-price').first().text().trim();

            if (!href || !name) return;

            const detailUrl = href.startsWith('http') ? href : `https://pcmarket.vn${href}`;
            items.push({ detailUrl, name, price: parsePrice(priceText) });
        });

        for (const item of items) {
            let detailHtml;
            try {
                const res = await axios.get(item.detailUrl, { headers: HEADERS, timeout: 30000 });
                detailHtml = res.data;
            } catch (error) {
                console.log(`[PCMarket] Detail skip ${item.detailUrl}: ${error.message}`);
                continue;
            }

            const d = cheerio.load(detailHtml);
            const images = [];
            d('img[src*="media/product"]').each((_, img) => {
                const src = d(img).attr('src');
                if (!src) return;
                const full = src.startsWith('http') ? src : `https://pcmarket.vn${src}`;
                const base = full.replace('/250_', '/');
                if (!isLikelyProductImage(base)) return;
                if (!images.includes(base)) images.push(base);
            });

            const variantOptions = [];
            d('.tb-hura8-variant-selection tr').each((_, tr) => {
                const label = d(tr).find('.variant-option-label, td').first().text().trim();
                if (!label) return;

                const values = [];
                d(tr)
                    .find('label, .variant-option-item, td:not(.variant-option-label)')
                    .each((__, node) => {
                        const raw = d(node).find('span').text().trim() || d(node).text().trim();
                        if (!raw || raw === label || raw.includes(label)) return;
                        raw
                            .split(/(?<=[a-z0-9])(?=[A-Z][a-z])|(?=SSD\s)/)
                            .map((x) => x.trim())
                            .filter(Boolean)
                            .forEach((x) => {
                                if (!values.includes(x)) values.push(x);
                            });
                    });

                if (values.length) variantOptions.push({ label, values });
            });

            const price = parsePrice(d('.bk-product-price').text()) || item.price;

            const normalizedName = normalizeProductName(d('h1').text().trim() || item.name);
            if (!isReasonableProductName(normalizedName)) {
                await delay(80);
                continue;
            }

            const normalized = {
                source: 'pcmarket.vn',
                categoryName: normalizeCategoryName(cat.category, {
                    name: normalizedName,
                    sourceUrl: item.detailUrl,
                }),
                name: normalizedName,
                description: extractDescriptionHtmlFromCheerio(
                    d,
                    ['.pro-desc-container', '.product-description', '.pro-detail-content', '#content'],
                    d('meta[name="description"]').attr('content') || '',
                    normalizedName,
                ),
                images: images.slice(0, 8),
                basePrice: price,
            };

            if (variantOptions.length > 0) {
                const combos = cartesianProduct(variantOptions.map((o) => o.values)).slice(0, 12);
                normalized.variants = combos.map((combo, idx) => {
                    const combination = {};
                    for (let i = 0; i < variantOptions.length; i += 1) {
                        combination[makeSlug(variantOptions[i].label)] = combo[i];
                    }
                    return {
                        sku: `${makeSlug(normalized.name).substring(0, 18).toUpperCase()}-PCM-${String(idx + 1).padStart(3, '0')}`,
                        subDescription: Object.values(combination).join(' / '),
                        price: Math.round(price * (1 + idx * 0.02)),
                        stock: 8 + idx,
                        discount: idx % 4 === 0 ? 5 : 0,
                        combination,
                        images: normalized.images,
                    };
                });
            } else {
                normalized.variants = generateSyntheticVariants(normalized, normalized.basePrice);
            }

            all.push(normalized);
            await delay(CONFIG.requestDelayMs);
        }
    }

    return all;
}

async function scrapeGearVN() {
    const all = [];

    for (const col of GEARVN_COLLECTIONS) {
        const url = `https://gearvn.com/collections/${col.handle}/products.json?limit=${CONFIG.maxProductsPerCategory}`;
        let data;
        try {
            const res = await axios.get(url, { timeout: 30000 });
            data = res.data;
        } catch (error) {
            console.log(`[GearVN] Skip ${col.handle}: ${error.message}`);
            continue;
        }

        const products = data.products || [];
        for (const p of products) {
            const images = (p.images || []).map((img) => img.src).filter(Boolean).slice(0, 8);
            const cleanImages = images.filter(isLikelyProductImage);
            const normalizedName = normalizeProductName(p.title);
            if (!isReasonableProductName(normalizedName)) continue;
            const shopifyVariants = p.variants || [];

            const variants = shopifyVariants.length
                ? shopifyVariants.map((sv, idx) => {
                    const combination = {};
                    if (sv.option1) combination.option1 = sv.option1;
                    if (sv.option2) combination.option2 = sv.option2;
                    if (sv.option3) combination.option3 = sv.option3;

                    const sale = parsePrice(sv.price || '0');
                    const compareAt = parsePrice(sv.compare_at_price || '0');
                    const price = compareAt > 0 ? compareAt : sale;
                    const discount = compareAt > sale && sale > 0 ? Math.round((1 - sale / compareAt) * 100) : 0;

                    return {
                        sku: sv.sku || `${makeSlug(p.title).substring(0, 18).toUpperCase()}-GVN-${String(idx + 1).padStart(3, '0')}`,
                        subDescription: sv.title || '',
                        price: price || 100000,
                        stock: 10 + idx,
                        discount,
                        combination,
                        images,
                    };
                })
                : generateSyntheticVariants({ name: p.title, categoryName: col.category, images }, parsePrice(p.variants?.[0]?.price || '100000'));
            const finalVariants = variants.length ? variants : generateSyntheticVariants({ name: normalizedName, categoryName: col.category, images: cleanImages }, parsePrice(p.variants?.[0]?.price || '100000'));

            all.push({
                source: 'gearvn.com',
                categoryName: normalizeCategoryName(col.category, {
                    name: normalizedName,
                    sourceUrl: p.handle ? `https://gearvn.com/products/${p.handle}` : '',
                }),
                name: normalizedName,
                description: (p.body_html || '').trim() || `<p>${escapeHtml(normalizedName)}</p>`,
                images: cleanImages,
                basePrice: parsePrice(p.variants?.[0]?.price || '0') || 100000,
                variants: finalVariants,
            });
        }

        await delay(CONFIG.requestDelayMs);
    }

    return all;
}

async function scrapeCellphoneS() {
    const all = [];
    for (const page of CELLPHONES_LISTING_PAGES) {
        let html;
        try {
            const res = await axios.get(page.url, { headers: HEADERS, timeout: 30000 });
            html = res.data;
        } catch (error) {
            console.log(`[CellphoneS] Skip ${page.url}: ${error.message}`);
            continue;
        }

        const $ = cheerio.load(html);
        const cards = $('.product-item').slice(0, CONFIG.maxProductsPerCategory);
        const items = [];

        cards.each((idx, el) => {
            const root = $(el);
            const name =
                root.find('.product__name, .product__name h3, h3').first().text().trim() ||
                root.find('img').first().attr('alt') ||
                '';
            const href = root.find('a').first().attr('href') || '';
            const image =
                root.find('img').first().attr('src') ||
                root.find('img').first().attr('data-src') ||
                '';
            const priceText =
                root.find('.product__price--show, .product__price, .price').first().text().trim() ||
                '';

            if (!name || !href) return;

            const basePrice = parsePrice(priceText) || 100000;
            items.push({
                name,
                href,
                image,
                basePrice,
            });

            if (idx >= CONFIG.maxProductsPerCategory - 1) return false;
        });

        for (const item of items) {
            const cleanName = normalizeProductName(item.name);
            if (!isReasonableProductName(cleanName)) continue;

            const images = [normalizeImageUrl(item.image, 'https://cellphones.com.vn')].filter(isLikelyProductImage);
            const detailUrl = normalizeImageUrl(item.href, 'https://cellphones.com.vn');

            let descriptionHtml = `<p>${escapeHtml(cleanName)}</p>`;
            try {
                const detailRes = await axios.get(detailUrl, { headers: HEADERS, timeout: 30000 });
                const d = cheerio.load(detailRes.data);
                descriptionHtml = extractDescriptionHtmlFromCheerio(
                    d,
                    ['.description-content', '.product-details', '#boxDescription', '.technical-content'],
                    d('meta[name="description"]').attr('content') || d('meta[property="og:description"]').attr('content') || '',
                    cleanName,
                );
            } catch (error) {
                console.log(`[CellphoneS] Detail skip ${detailUrl}: ${error.message}`);
            }

            const normalized = {
                source: 'cellphones.com.vn',
                sourceUrl: detailUrl,
                categoryName: normalizeCategoryName(page.category, {
                    name: cleanName,
                    sourceUrl: detailUrl,
                }),
                name: cleanName,
                description: descriptionHtml,
                images,
                basePrice: item.basePrice,
            };
            normalized.variants = generateSyntheticVariants(normalized, item.basePrice);
            all.push(normalized);
            await delay(120);
        }

        await delay(CONFIG.requestDelayMs);
    }
    return all;
}

async function scrapeHoangHaMobile() {
    const all = [];

    for (const listing of HOANGHA_LISTING_PAGES) {
        let html;
        try {
            const res = await axios.get(listing.url, { headers: HEADERS, timeout: 30000 });
            html = res.data;
        } catch (error) {
            console.log(`[HoangHa] Skip ${listing.url}: ${error.message}`);
            continue;
        }

        const $ = cheerio.load(html);
        const linkSet = new Set();
        $('a[href]').each((_, a) => {
            const href = ($(a).attr('href') || '').trim();
            if (!href) return;
            const abs = normalizeImageUrl(href, 'https://hoanghamobile.com');
            if (!abs.includes(listing.productPathMatch)) return;
            if (abs.includes('?')) {
                linkSet.add(abs.split('?')[0]);
            } else {
                linkSet.add(abs);
            }
        });

        const detailUrls = [...linkSet].slice(0, CONFIG.maxProductsPerCategory);
        for (const detailUrl of detailUrls) {
            let detailHtml;
            try {
                const res = await axios.get(detailUrl, { headers: HEADERS, timeout: 30000 });
                detailHtml = res.data;
            } catch (error) {
                console.log(`[HoangHa] Detail skip ${detailUrl}: ${error.message}`);
                continue;
            }

            const d = cheerio.load(detailHtml);
            const name = d('h1').first().text().trim();
            const priceText = d('.price, .product-price, .special-price, .final-price').first().text().trim();
            const basePrice = parsePrice(priceText) || 100000;
            const cleanName = normalizeProductName(name);
            if (!isReasonableProductName(cleanName)) continue;

            const images = [];
            d('img[src]').each((_, img) => {
                const src = d(img).attr('src');
                const normalized = normalizeImageUrl(src, 'https://hoanghamobile.com');
                if (!normalized.includes('cdn.hoanghamobile.vn')) return;
                if (!isLikelyProductImage(normalized)) return;
                if (!images.includes(normalized)) images.push(normalized);
            });

            const normalized = {
                source: 'hoanghamobile.com',
                sourceUrl: detailUrl,
                categoryName: normalizeCategoryName(listing.category, {
                    name: cleanName,
                    sourceUrl: detailUrl,
                }),
                name: cleanName,
                description: extractDescriptionHtmlFromCheerio(
                    d,
                    ['.product-description', '.product-detail-content', '#boxDescription', '.box-content'],
                    d('meta[name="description"]').attr('content') || '',
                    cleanName,
                ),
                images: images.slice(0, 8),
                basePrice,
            };
            normalized.variants = generateSyntheticVariants(normalized, basePrice);
            all.push(normalized);
            await delay(180);
        }

        await delay(CONFIG.requestDelayMs);
    }

    return all;
}

async function scrapeDummyJson() {
    const all = [];
    for (const c of DUMMYJSON_CATEGORIES) {
        const url = `https://dummyjson.com/products/category/${c.slug}?limit=${CONFIG.maxProductsPerCategory}`;
        let data;
        try {
            const res = await axios.get(url, { timeout: 30000 });
            data = res.data;
        } catch (error) {
            console.log(`[DummyJSON] Skip ${c.slug}: ${error.message}`);
            continue;
        }

        for (const p of data.products || []) {
            const images = (p.images || []).slice(0, 8);
            const basePrice = Math.round((Number(p.price) || 100) * 25000);
            const normalized = {
                source: 'dummyjson.com',
                categoryName: normalizeCategoryName(c.category, {
                    name: p.title,
                    sourceUrl: `https://dummyjson.com/products/${p.id || ''}`,
                }),
                name: p.title,
                description: `<p>${escapeHtml(p.description || p.title || '')}</p>`,
                images,
                basePrice,
            };
            normalized.variants = generateSyntheticVariants(normalized, basePrice);
            all.push(normalized);
        }

        await delay(CONFIG.requestDelayMs);
    }
    return all;
}

async function scrapeEscuelaApi() {
    const all = [];
    let data;
    try {
        const res = await axios.get('https://api.escuelajs.co/api/v1/products?offset=0&limit=120', { timeout: 30000 });
        data = res.data;
    } catch (error) {
        console.log(`[EscuelaAPI] Skip: ${error.message}`);
        return all;
    }

    for (const p of data || []) {
        const name = p.title || '';
        const desc = p.description || '';
        const bucket = `${name} ${desc}`.toLowerCase();
        const matched = ESCUELA_CATEGORY_HINTS.find((x) => bucket.includes(x.hint));
        if (!matched) continue;

        const images = (p.images || []).map((x) => normalizeImageUrl(x)).filter(Boolean).slice(0, 8);
        const basePrice = Math.max(100000, Math.round((Number(p.price) || 40) * 25000));

        const normalized = {
            source: 'api.escuelajs.co',
            sourceUrl: p.slug ? `https://api.escuelajs.co/api/v1/products/slug/${p.slug}` : '',
            categoryName: normalizeCategoryName(matched.category, {
                name,
                sourceUrl: p.slug ? `https://api.escuelajs.co/api/v1/products/slug/${p.slug}` : '',
            }),
            name,
            description: `<p>${escapeHtml(desc || name)}</p>`,
            images,
            basePrice,
        };
        normalized.variants = generateSyntheticVariants(normalized, basePrice);
        all.push(normalized);
    }

    return all.slice(0, CONFIG.maxProductsPerCategory * 4);
}

async function scrapeFakeStore() {
    const all = [];
    let data;
    try {
        const res = await axios.get('https://fakestoreapi.com/products/category/electronics', { timeout: 30000 });
        data = res.data;
    } catch (error) {
        console.log(`[FakeStore] Skip: ${error.message}`);
        return all;
    }

    for (const p of data || []) {
        const name = p.title || '';
        const c = name.toLowerCase();
        const categoryName =
            c.includes('laptop') ? 'Laptop' : c.includes('monitor') ? 'Màn hình máy tính' : 'Điện tử';
        const basePrice = Math.max(100000, Math.round((Number(p.price) || 50) * 25000));

        const normalized = {
            source: 'fakestoreapi.com',
            sourceUrl: `https://fakestoreapi.com/products/${p.id}`,
            categoryName: normalizeCategoryName(categoryName, {
                name,
                sourceUrl: `https://fakestoreapi.com/products/${p.id}`,
            }),
            name,
            description: `<p>${escapeHtml(p.description || p.title || '')}</p>`,
            images: [normalizeImageUrl(p.image)].filter(Boolean),
            basePrice,
        };
        normalized.variants = generateSyntheticVariants(normalized, basePrice);
        all.push(normalized);
    }

    return all;
}

async function getAdminToken() {
    if (CONFIG.adminIDEmp && CONFIG.adminPassword) {
        const loginUrl = `${CONFIG.backendBaseUrl}/admin/auth/login`;
        const res = await axios.post(loginUrl, {
            IDEmp: CONFIG.adminIDEmp,
            password: CONFIG.adminPassword,
        });
        const payload = unwrapApi(res.data) || {};
        if (payload.access_token) return payload.access_token;
    }

    if (CONFIG.adminToken) return CONFIG.adminToken;
    return '';
}

async function connectMongo() {
    if (!CONFIG.mongoUri) {
        throw new Error('Missing MONGODB_URI in .env');
    }

    const client = new MongoClient(CONFIG.mongoUri, {
        maxPoolSize: 20,
    });
    await client.connect();
    return {
        client,
        db: client.db(CONFIG.mongoDbName),
    };
}

async function ensureCategoriesInMongo(db) {
    const categoriesCol = db.collection('categories');

    if (CONFIG.clearMongoBeforeInsert) {
        await categoriesCol.deleteMany({});
    }

    const allExisting = await categoriesCol.find({ isDeleted: { $ne: true } }).toArray();

    const mapByKey = new Map();
    const usedSlugs = new Set();

    for (const cat of allExisting) {
        const slug = String(cat.slug || '');
        if (slug) usedSlugs.add(slug);
        registerCategory(mapByKey, cat);
    }

    for (const catDef of CATEGORY_TREE) {
        const key = canonicalCategoryKey(catDef.name);
        const existing = mapByKey.get(key);

        let parentId = null;
        if (catDef.parent) {
            const parent = mapByKey.get(canonicalCategoryKey(catDef.parent));
            if (parent?._id) parentId = toObjectIdStrict(parent._id, 'category.parentId');
        }

        if (existing?._id) {
            const updates = {};
            if (!objectIdEquals(existing.parentId || null, parentId || null)) {
                updates.parentId = parentId;
            }
            if (existing.name !== catDef.name) {
                updates.name = catDef.name;
            }
            if (!existing.slug) {
                updates.slug = createUniqueSlug(makeSlug(catDef.name), usedSlugs);
            } else {
                usedSlugs.add(String(existing.slug));
            }
            if (existing.isDeleted === true) {
                updates.isDeleted = false;
            }

            if (Object.keys(updates).length > 0) {
                updates.updatedAt = new Date();
                await categoriesCol.updateOne({ _id: existing._id }, { $set: updates });
                Object.assign(existing, updates);
            }
            registerCategory(mapByKey, existing);
            continue;
        }

        const now = new Date();
        const catDoc = {
            _id: new ObjectId(),
            name: catDef.name,
            parentId,
            slug: createUniqueSlug(makeSlug(catDef.name), usedSlugs),
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
        };
        await categoriesCol.insertOne(catDoc);
        registerCategory(mapByKey, catDoc);
    }

    return mapByKey;
}

async function insertProductsViaMongo(db, products, categoryMap) {
    const productsCol = db.collection('products');
    const variantsCol = db.collection('productvariants');
    const attributesCol = db.collection('productattributes');
    const attributeValuesCol = db.collection('productattributevalues');
    const attributeAllowValuesCol = db.collection('productattributeallowvalues');
    const brandsCol = db.collection('brands');

    if (CONFIG.clearMongoBeforeInsert) {
        await productsCol.deleteMany({});
        await variantsCol.deleteMany({});
        await attributeAllowValuesCol.deleteMany({});
        await attributeValuesCol.deleteMany({});
        await attributesCol.deleteMany({});
        await brandsCol.deleteMany({});
    }

    // Brand cache
    const existingBrands = await brandsCol.find({ isDeleted: { $ne: true } }).toArray();
    const brandBySlug = new Map();
    const usedBrandSlugs = new Set();
    for (const b of existingBrands) {
        const bSlug = makeSlug(b.name || '');
        if (bSlug) {
            brandBySlug.set(bSlug, b);
            usedBrandSlugs.add(String(b.slug || ''));
        }
    }

    const existingProducts = await productsCol
        .find({}, { projection: { slug: 1 } })
        .toArray();
    const usedProductSlugs = new Set(existingProducts.map((x) => String(x.slug || '')).filter(Boolean));

    const existingSkus = await variantsCol
        .find({}, { projection: { sku: 1 } })
        .toArray();
    const usedVariantSkus = new Set(
        existingSkus
            .map((x) => String(x.sku || '').trim().toUpperCase())
            .filter(Boolean),
    );

    const existingAttributes = await attributesCol
        .find({ isDeleted: { $ne: true } }, { projection: { _id: 1, code: 1, name: 1 } })
        .toArray();
    const attributeByCode = new Map();
    for (const attr of existingAttributes) {
        const code = makeSlug(attr.code || attr.name || '');
        if (!code) continue;
        attributeByCode.set(code, {
            _id: toObjectIdStrict(attr._id, 'productattributes._id'),
            code,
            name: attr.name || buildAttributeName(code),
        });
    }

    const existingAttributeValues = await attributeValuesCol
        .find(
            { isDeleted: { $ne: true } },
            { projection: { _id: 1, attribute: 1, value: 1, label: 1 } },
        )
        .toArray();
    const attributeValueByKey = new Map();
    for (const val of existingAttributeValues) {
        if (!val.attribute) continue;
        const attrId = toObjectIdHex(val.attribute, 'productattributevalues.attribute');
        const valueKey = normalizeAttributeValue(val.value || val.label || '');
        if (!valueKey) continue;
        attributeValueByKey.set(`${attrId}::${valueKey}`, {
            _id: toObjectIdStrict(val._id, 'productattributevalues._id'),
        });
    }

    let createdProducts = 0;
    let createdVariants = 0;
    let createdAttributes = 0;
    let createdAttributeValues = 0;
    let createdAttributeAllowValues = 0;
    let skipped = 0;

    for (const p of products) {
        const category =
            categoryMap.get(canonicalCategoryKey(p.categoryName)) ||
            categoryMap.get(canonicalCategoryKey(makeSlug(p.categoryName)));

        if (!category?._id) {
            skipped += 1;
            continue;
        }

        const variantsWithPriceDiversity = diversifyVariantPrices(
            p.variants || [],
            p.name,
            p.basePrice || 100000,
        );

        const cleanVariants = variantsWithPriceDiversity.filter(
            (v) => Number.isFinite(v.price) && v.price > 0,
        );

        if (!cleanVariants.length) {
            skipped += 1;
            continue;
        }

        const prices = cleanVariants.map((v) => v.price);
        const now = new Date();
        const productId = new ObjectId();

        // Brand detection
        let brandId = null;
        const detectedBrand = detectBrand(p.name);
        if (detectedBrand) {
            const brandSlug = makeSlug(detectedBrand.name);
            let brandRef = brandBySlug.get(brandSlug);
            if (!brandRef) {
                const brandDoc = {
                    _id: new ObjectId(),
                    name: detectedBrand.name,
                    slug: createUniqueSlug(brandSlug, usedBrandSlugs),
                    description: '',
                    logo: detectedBrand.logo || '',
                    website: '',
                    status: 'ACTIVE',
                    feature: true,
                    isDeleted: false,
                    createdAt: now,
                    updatedAt: now,
                };
                try {
                    await brandsCol.insertOne(brandDoc);
                    brandBySlug.set(brandSlug, brandDoc);
                    brandRef = brandDoc;
                } catch (brandError) {
                    // Handle duplicate slug - find existing brand
                    const existing = await brandsCol.findOne({ slug: brandDoc.slug });
                    if (existing) {
                        brandRef = existing;
                        brandBySlug.set(brandSlug, existing);
                    } else {
                        console.log(`[Brand] Warning: ${brandError.message}`);
                    }
                }
            }
            if (brandRef) brandId = toObjectIdStrict(brandRef._id, 'brand._id');
        }

        const productDoc = {
            _id: productId,
            name: p.name,
            slug: createUniqueSlug(makeSlug(p.name), usedProductSlugs),
            description: p.description || '',
            brand: brandId,
            category: toObjectIdStrict(category._id, 'category._id'),
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            status: 'ACTIVE',
            defaultProductVariantId: null,
            totalRatings: 0,
            avgRating: 0,
            totalStock: 0,
            createdBy: DEFAULT_CREATED_BY_OBJECT_ID,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
        };

        const variantDocs = cleanVariants.map((v, i) => ({
            _id: new ObjectId(),
            sku: makeUniqueSku(v.sku, p.name, i, usedVariantSkus),
            subDescription: v.subDescription || '',
            product: productId,
            price: v.price,
            stock: Number.isFinite(v.stock) ? v.stock : 10,
            discount: Number.isFinite(v.discount) ? v.discount : 0,
            combination: v.combination || {},
            images: Array.isArray(v.images) ? v.images.slice(0, 8) : [],
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
        }));

        const totalStock = variantDocs.reduce((sum, item) => sum + (item.stock || 0), 0);
        productDoc.defaultProductVariantId = variantDocs[0]._id;
        productDoc.totalStock = totalStock;

        const rawProductAttributes = new Map();
        for (const variant of cleanVariants) {
            const combination = variant.combination && typeof variant.combination === 'object'
                ? variant.combination
                : {};
            for (const [rawKey, rawValue] of Object.entries(combination)) {
                if (!rawKey || rawValue === null || rawValue === undefined) continue;
                const code = makeSlug(rawKey);
                const valueText = String(rawValue).trim();
                const valueKey = normalizeAttributeValue(valueText);
                if (!code || !valueKey) continue;

                const dedupeKey = `${code}::${valueKey}`;
                if (rawProductAttributes.has(dedupeKey)) continue;
                rawProductAttributes.set(dedupeKey, {
                    code,
                    name: buildAttributeName(rawKey),
                    value: valueText,
                    valueKey,
                });
            }
        }

        try {
            await productsCol.insertOne(productDoc);
            await variantsCol.insertMany(variantDocs, { ordered: false });

            if (rawProductAttributes.size > 0) {
                const allowDocs = [];
                const allowDedupeSet = new Set();

                for (const item of rawProductAttributes.values()) {
                    let attributeRef = attributeByCode.get(item.code);
                    if (!attributeRef) {
                        const attrNow = new Date();
                        const attrDoc = {
                            _id: new ObjectId(),
                            name: item.name,
                            code: item.code,
                            displayType: inferDisplayType(item.code),
                            createdBy: DEFAULT_CREATED_BY_OBJECT_ID,
                            isDeleted: false,
                            createdAt: attrNow,
                            updatedAt: attrNow,
                        };
                        await attributesCol.insertOne(attrDoc);
                        attributeRef = {
                            _id: attrDoc._id,
                            code: attrDoc.code,
                            name: attrDoc.name,
                        };
                        attributeByCode.set(item.code, attributeRef);
                        createdAttributes += 1;
                    }

                    const attributeIdHex = toObjectIdHex(attributeRef._id, 'attribute._id');
                    const valueLookupKey = `${attributeIdHex}::${item.valueKey}`;
                    let attributeValueRef = attributeValueByKey.get(valueLookupKey);

                    if (!attributeValueRef) {
                        const valueNow = new Date();
                        const attrValueDoc = {
                            _id: new ObjectId(),
                            value: item.value,
                            label: item.value,
                            attribute: toObjectIdStrict(attributeRef._id, 'attribute._id'),
                            colorHex: inferColorHex(item.code, item.value),
                            imageUrl: '',
                            createdBy: DEFAULT_CREATED_BY_OBJECT_ID,
                            isDeleted: false,
                            createdAt: valueNow,
                            updatedAt: valueNow,
                        };
                        await attributeValuesCol.insertOne(attrValueDoc);
                        attributeValueRef = { _id: attrValueDoc._id };
                        attributeValueByKey.set(valueLookupKey, attributeValueRef);
                        createdAttributeValues += 1;
                    }

                    const allowKey = `${toObjectIdHex(productId, 'product._id')}::${toObjectIdHex(
                        attributeValueRef._id,
                        'attributeValue._id',
                    )}`;
                    if (allowDedupeSet.has(allowKey)) continue;

                    allowDedupeSet.add(allowKey);
                    allowDocs.push({
                        _id: new ObjectId(),
                        product: productId,
                        attributeValue: toObjectIdStrict(attributeValueRef._id, 'attributeValue._id'),
                        isDeleted: false,
                        createdAt: now,
                        updatedAt: now,
                    });
                }

                if (allowDocs.length) {
                    await attributeAllowValuesCol.insertMany(allowDocs, { ordered: false });
                    createdAttributeAllowValues += allowDocs.length;
                }
            }

            createdProducts += 1;
            createdVariants += variantDocs.length;
        } catch (error) {
            skipped += 1;
            console.log(`[Insert Mongo] Skip ${p.name}: ${error.message}`);
        }

        await delay(60);
    }

    return {
        createdProducts,
        createdVariants,
        createdAttributes,
        createdAttributeValues,
        createdAttributeAllowValues,
        skipped,
    };
}

async function clearElasticsearch() {
    if (!CONFIG.clearElasticBeforeInsert) return;

    try {
        if (CONFIG.elasticDeleteAll) {
            try {
                await axios.delete(`${CONFIG.elasticsearchUrl}/_all`, { timeout: 30000 });
                console.log('[Elastic] Deleted all indices');
                return;
            } catch (error) {
                const status = error.response?.status;
                const reason = error.response?.data?.error?.reason || '';
                const wildcardBlocked =
                    status === 400 &&
                    String(reason).toLowerCase().includes('wildcard expressions or all indices are not allowed');

                if (!wildcardBlocked) throw error;

                const listRes = await axios.get(`${CONFIG.elasticsearchUrl}/_cat/indices?format=json`, {
                    timeout: 30000,
                });
                const indexRows = Array.isArray(listRes.data) ? listRes.data : [];
                const indexNames = indexRows
                    .map((row) => row.index)
                    .filter((name) => typeof name === 'string' && name.length > 0 && !name.startsWith('.'));

                if (!indexNames.length) {
                    console.log('[Elastic] No user indices to delete');
                    return;
                }

                for (const name of indexNames) {
                    await axios.delete(`${CONFIG.elasticsearchUrl}/${encodeURIComponent(name)}`, {
                        timeout: 30000,
                    });
                    console.log(`[Elastic] Deleted index ${name}`);
                }
                return;
            }
        }
        await axios.delete(`${CONFIG.elasticsearchUrl}/${CONFIG.elasticIndex}`, { timeout: 30000 });
        console.log(`[Elastic] Deleted index ${CONFIG.elasticIndex}`);
    } catch (error) {
        const status = error.response?.status;
        if (status === 404) {
            console.log('[Elastic] Index not found, skip delete');
            return;
        }
        console.log(`[Elastic] Delete warning: ${error.message}`);
    }
}

async function triggerReindex(adminAuthHeader) {
    try {
        await axios.post(
            `${CONFIG.backendBaseUrl}/admin/product/reindex-elasticsearch`,
            {},
            { headers: adminAuthHeader, timeout: 300000 },
        );
        return true;
    } catch (error) {
        console.log(`[Reindex] Warning: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function triggerAiReindex() {
    if (!CONFIG.triggerAiReindex) {
        return { ok: false, skipped: true, via: 'disabled', message: 'AI reindex disabled by config', count: 0 };
    }

    const gatewayUrl = `${CONFIG.backendBaseUrl}/client/chatbot/reindex`;
    try {
        const res = await axios.post(gatewayUrl, {}, { timeout: 300000 });
        const payload = unwrapApi(res.data) || res.data || {};
        return {
            ok: true,
            skipped: false,
            via: 'api-gateway',
            message: payload.message || 'AI reindex triggered via API Gateway',
            count: Number(payload.count) || 0,
        };
    } catch (gatewayError) {
        const directUrl = `${CONFIG.aiServiceUrl}/api/v1/ai/reindex`;
        try {
            const res = await axios.post(directUrl, {}, { timeout: 300000 });
            const payload = unwrapApi(res.data) || res.data || {};
            return {
                ok: true,
                skipped: false,
                via: 'ai-service',
                message: payload.message || 'AI reindex triggered via AI service',
                count: Number(payload.count) || 0,
            };
        } catch (aiError) {
            return {
                ok: false,
                skipped: false,
                via: 'failed',
                message: `Gateway error: ${gatewayError.message}; AI service error: ${aiError.message}`,
                count: 0,
            };
        }
    }
}

async function main() {
    console.log('='.repeat(72));
    console.log('Scrape PC products -> MongoDB + Elasticsearch + AI Vector');
    console.log('='.repeat(72));

    let adminAuthHeader = null;
    try {
        const adminToken = await getAdminToken();
        if (adminToken) {
            adminAuthHeader = { Authorization: `Bearer ${adminToken}` };
        }
    } catch (error) {
        console.log(`[Auth] Warning: ${error.message}`);
    }

    await clearElasticsearch();

    console.log('\n[Scrape] PCMarket...');
    const pcmProducts = await scrapePcMarket();
    console.log(`[Scrape] PCMarket products: ${pcmProducts.length}`);

    console.log('\n[Scrape] GearVN (Shopify API)...');
    const gearProducts = await scrapeGearVN();
    console.log(`[Scrape] GearVN products: ${gearProducts.length}`);

    console.log('\n[Scrape] CellphoneS...');
    const cellProducts = await scrapeCellphoneS();
    console.log(`[Scrape] CellphoneS products: ${cellProducts.length}`);

    console.log('\n[Scrape] HoangHaMobile...');
    const hhmProducts = await scrapeHoangHaMobile();
    console.log(`[Scrape] HoangHaMobile products: ${hhmProducts.length}`);

    const merged = [
        ...pcmProducts,
        ...gearProducts,
        ...cellProducts,
        ...hhmProducts,
    ];
    const dedupMap = new Map();
    for (const p of merged) {
        p.categoryName = normalizeCategoryName(p.categoryName, {
            name: p.name,
            sourceUrl: p.sourceUrl,
        });
        const key = `${makeSlug(p.name)}::${makeSlug(p.categoryName)}`;
        if (!dedupMap.has(key)) dedupMap.set(key, p);
    }
    let products = [...dedupMap.values()];
    console.log(`\n[Normalize] Total unique products before top-up: ${products.length}`);

    // Show category distribution
    const catDist = {};
    for (const p of products) {
        catDist[p.categoryName] = (catDist[p.categoryName] || 0) + 1;
    }
    console.log('[Normalize] Category distribution:');
    for (const [cat, count] of Object.entries(catDist).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${cat}: ${count}`);
    }

    products = expandProductsToTarget(products, CONFIG.targetProductCount);
    console.log(`[Normalize] Total products after top-up: ${products.length}`);

    const mongo = await connectMongo();
    let insertResult;
    try {
        const categoryMap = await ensureCategoriesInMongo(mongo.db);
        insertResult = await insertProductsViaMongo(mongo.db, products, categoryMap);
    } finally {
        await mongo.client.close();
    }

    console.log('\n[Index] Triggering Elasticsearch reindex...');
    const reindexOk = adminAuthHeader ? await triggerReindex(adminAuthHeader) : false;
    console.log(`[Index] Elasticsearch reindex: ${reindexOk ? 'OK' : 'SKIPPED (no auth or failed)'}`);

    console.log('\n[AI] Triggering AI vector reindex (Qdrant)...');
    const aiReindex = await triggerAiReindex();
    console.log(`[AI] AI reindex: ${aiReindex.ok ? 'OK' : 'FAILED'} via ${aiReindex.via} - ${aiReindex.message}`);

    const report = {
        timestamp: new Date().toISOString(),
        config: {
            backendBaseUrl: CONFIG.backendBaseUrl,
            elasticsearchUrl: CONFIG.elasticsearchUrl,
            mongoDbName: CONFIG.mongoDbName,
            maxProductsPerCategory: CONFIG.maxProductsPerCategory,
            maxSyntheticVariants: CONFIG.maxSyntheticVariants,
            targetProductCount: CONFIG.targetProductCount,
            syntheticTopUp: CONFIG.syntheticTopUp,
            topUpVariantCap: CONFIG.topUpVariantCap,
            defaultCreatedBy: DEFAULT_CREATED_BY_OBJECT_ID.toHexString(),
            clearElasticBeforeInsert: CONFIG.clearElasticBeforeInsert,
            elasticDeleteAll: CONFIG.elasticDeleteAll,
            clearMongoBeforeInsert: CONFIG.clearMongoBeforeInsert,
            triggerAiReindex: CONFIG.triggerAiReindex,
        },
        scraped: {
            pcmarket: pcmProducts.length,
            gearvn: gearProducts.length,
            cellphones: cellProducts.length,
            hoanghamobile: hhmProducts.length,
            uniqueProducts: products.length,
        },
        categoryDistribution: catDist,
        inserted: insertResult,
        reindexTriggered: reindexOk,
        aiReindex,
    };

    fs.writeFileSync(CONFIG.outputReport, JSON.stringify(report, null, 2), 'utf-8');

    console.log('\n' + '='.repeat(72));
    console.log('Done');
    console.log(JSON.stringify(report, null, 2));
    console.log(`Report file: ${CONFIG.outputReport}`);
    console.log('='.repeat(72));
}

main().catch((error) => {
    console.error('[FATAL]', error.message);
    process.exit(1);
});
