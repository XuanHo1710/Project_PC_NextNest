/**
 * Description cleanup script for Project PC products.
 * Cleans scraped HTML descriptions by:
 * 1. Removing <script>, <style>, <iframe>, <noscript> tags
 * 2. Extracting product content from CellphoneS full-page HTML
 * 3. Removing site chrome (nav, footer, payment methods, GTM)
 * 4. Removing external tracking/ad content
 * 5. Sanitizing remaining HTML
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://xuanhodcbas:0984232310ho.@cluster0.f7sbfkn.mongodb.net/project-pc-hoang-ha';

// Patterns to completely remove (tag + content)
const STRIP_TAGS_WITH_CONTENT = [
    /<script[\s\S]*?<\/script>/gi,
    /<style[\s\S]*?<\/style>/gi,
    /<iframe[\s\S]*?<\/iframe>/gi,
    /<noscript[\s\S]*?<\/noscript>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
];

// CellphoneS-specific junk patterns
const CELLPHONES_JUNK_PATTERNS = [
    // Payment method sections
    /Phương thức thanh toán[\s\S]*?(?=<(?:h[1-6]|div class="product)|$)/gi,
    // Newsletter/voucher signup  
    /ĐĂNG KÝ NHẬN TIN KHUYẾN MÃI[\s\S]*?(?=<(?:h[1-6]|div class="product)|$)/gi,
    /Nhận ngay Voucher[\s\S]*?(?=<(?:h[1-6])|$)/gi,
    // Site footer content
    /Nhập số điện thoại của bạ[\s\S]*$/gi,
    // CellphoneS branding/links
    /<a[^>]*href="https?:\/\/cellphones\.com\.vn[^"]*"[^>]*>.*?<\/a>/gi,
    // Social media widgets  
    /class="social-share[\s\S]*?<\/div>/gi,
    // Related articles sections
    /Tin tức liên quan[\s\S]*$/gi,
    // Breadcrumb
    /<nav[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>[\s\S]*?<\/nav>/gi,
    // Header elements
    /<header[\s\S]*?<\/header>/gi,
    // Footer elements
    /<footer[\s\S]*?<\/footer>/gi,
];

// GearVN junk patterns
const GEARVN_JUNK_PATTERNS = [
    /<a[^>]*href="https?:\/\/gearvn\.com[^"]*"[^>]*>.*?<\/a>/gi,
];

// General junk
const GENERAL_JUNK_PATTERNS = [
    // Google Tag Manager
    /\(function\s*\(\s*w\s*,\s*d\s*,\s*s\s*,\s*l\s*,\s*i\s*\)[\s\S]*?GTM-[A-Z0-9]+[\s\S]*?\}\s*\)\s*;/gi,
    // data-* attributes from framework SSR
    /\s+data-server-rendered="[^"]*"/gi,
    /\s+data-fetch-key="[^"]*"/gi,
    /\s+data-v-[a-f0-9]+/gi,
    // Empty divs with IDs from frameworks
    /<div\s+id="(?:__nuxt|__layout|layout-desktop|cpsHeaderOutLine|cpsHeader|topBarHeader)"[^>]*>/gi,
    // Tracking pixels
    /<img[^>]*(?:tracking|pixel|analytics|facebook\.com\/tr|google-analytics)[^>]*>/gi,
    // onclick handlers
    /\s+onclick="[^"]*"/gi,
    /\s+onload="[^"]*"/gi,
];

function extractCellphonesContent(html) {
    // CellphoneS descriptions are full page HTML wrapped in <article>
    // The actual product description is typically inside specific content divs

    // Try to find the product description section
    const contentPatterns = [
        // Look for the main product description content
        /<div[^>]*class="[^"]*(?:product-description|product-content|block-content-product|cpsdescription|cps-block-content)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>|<div[^>]*class="[^"]*(?:product-rating|product-review|block-comment))/i,
        // Another common pattern
        /<div[^>]*class="[^"]*block-content-product[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class/i,
        // Generic article content
        /<article[^>]*>([\s\S]*?)<\/article>/i,
    ];

    for (const pattern of contentPatterns) {
        const match = html.match(pattern);
        if (match && match[1] && match[1].length > 200) {
            return match[1];
        }
    }

    // Fallback: strip the outer framework wrappers and return what's left
    let cleaned = html;
    // Remove the outer article/div wrappers from CellphoneS SSR
    cleaned = cleaned.replace(/^<article><div data-server-rendered="true" id="__nuxt"><div id="__layout"><div id="layout-desktop"[^>]*>/i, '');
    cleaned = cleaned.replace(/<\/div><\/div><\/div><\/article>$/i, '');

    return cleaned;
}

function cleanDescription(description, productName) {
    if (!description || description.length < 10) return description;

    let cleaned = description;

    // Detect CellphoneS full-page HTML
    const isCellphonesFullPage = cleaned.includes('data-server-rendered="true"') && cleaned.includes('__nuxt');

    if (isCellphonesFullPage) {
        cleaned = extractCellphonesContent(cleaned);
    }

    // Strip dangerous/unnecessary tags with their content
    for (const pattern of STRIP_TAGS_WITH_CONTENT) {
        cleaned = cleaned.replace(pattern, '');
    }

    // Remove CellphoneS junk
    for (const pattern of CELLPHONES_JUNK_PATTERNS) {
        cleaned = cleaned.replace(pattern, '');
    }

    // Remove GearVN junk
    for (const pattern of GEARVN_JUNK_PATTERNS) {
        cleaned = cleaned.replace(pattern, '');
    }

    // Remove general junk
    for (const pattern of GENERAL_JUNK_PATTERNS) {
        cleaned = cleaned.replace(pattern, '');
    }

    // Remove empty elements
    cleaned = cleaned.replace(/<(div|span|p|a|section|article|nav|header|footer|aside)\b[^>]*>\s*<\/\1>/gi, '');
    // Do it again for nested empty elements
    cleaned = cleaned.replace(/<(div|span|p|a|section|article|nav|header|footer|aside)\b[^>]*>\s*<\/\1>/gi, '');
    cleaned = cleaned.replace(/<(div|span|p|a|section|article|nav|header|footer|aside)\b[^>]*>\s*<\/\1>/gi, '');

    // Remove excessive whitespace
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    cleaned = cleaned.trim();

    // If cleaned is too short (< 50 chars), it was probably all junk — return empty
    if (cleaned.length < 50) {
        return '';
    }

    return cleaned;
}

async function main() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db();
    console.log('Connected to MongoDB');

    // Process in batches using cursor to avoid memory issues
    const total = await db.collection('products').countDocuments({
        isDeleted: false,
        description: { $exists: true, $ne: '' },
    });
    console.log(`Total products with descriptions: ${total}`);

    let cleaned = 0;
    let unchanged = 0;
    let errors = 0;
    let totalSizeBefore = 0;
    let totalSizeAfter = 0;
    let processed = 0;

    const batchSize = 50;
    let skip = 0;

    while (skip < total) {
        const products = await db.collection('products')
            .find({ isDeleted: false, description: { $exists: true, $ne: '' } })
            .project({ _id: 1, name: 1, description: 1 })
            .skip(skip)
            .limit(batchSize)
            .toArray();

        if (products.length === 0) break;

        const bulkOps = [];

        for (const product of products) {
            const original = product.description;
            totalSizeBefore += original.length;
            processed++;

            try {
                const cleanedDesc = cleanDescription(original, product.name);
                totalSizeAfter += cleanedDesc.length;

                if (cleanedDesc.length !== original.length) {
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: product._id },
                            update: { $set: { description: cleanedDesc } }
                        }
                    });
                    cleaned++;

                    if (cleaned <= 10) {
                        const reduction = ((1 - cleanedDesc.length / original.length) * 100).toFixed(1);
                        console.log(`  Cleaned: ${product.name?.substring(0, 50)} | ${(original.length / 1024).toFixed(0)}KB -> ${(cleanedDesc.length / 1024).toFixed(0)}KB (${reduction}% reduction)`);
                    }
                } else {
                    unchanged++;
                }
            } catch (e) {
                errors++;
                console.error(`  Error cleaning ${product.name}: ${e.message}`);
            }
        }

        if (bulkOps.length > 0) {
            await db.collection('products').bulkWrite(bulkOps);
        }

        skip += batchSize;
        if (processed % 200 === 0) {
            console.log(`  Progress: ${processed}/${total} (${cleaned} cleaned)`);
        }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total processed: ${processed}`);
    console.log(`Cleaned: ${cleaned}`);
    console.log(`Unchanged: ${unchanged}`);
    console.log(`Errors: ${errors}`);
    console.log(`Total size before: ${(totalSizeBefore / 1024 / 1024).toFixed(1)} MB`);
    console.log(`Total size after: ${(totalSizeAfter / 1024 / 1024).toFixed(1)} MB`);
    if (totalSizeBefore > 0) {
        console.log(`Reduction: ${((1 - totalSizeAfter / totalSizeBefore) * 100).toFixed(1)}%`);
    }

    await client.close();
    console.log('Done!');
    process.exit(0);
}

main().catch(console.error);
