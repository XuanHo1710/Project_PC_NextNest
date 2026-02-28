const axios = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'vi-VN,vi;q=0.9',
};

async function scrapeProduct(url) {
    console.log(`Fetching ${url}...`);
    const resp = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(resp.data);

    // Product name
    console.log('=== PRODUCT NAME ===');
    console.log('h1:', $('h1').text().trim());

    // Price
    console.log('\n=== PRICE ===');
    console.log('price-new:', $('[class*="price-new"], [class*="price_new"], .new-price').text().trim().substring(0, 200));
    console.log('price-old:', $('[class*="price-old"], [class*="price_old"], .old-price').text().trim().substring(0, 200));
    console.log('price-sale:', $('[class*="sale"], [class*="discount"], [class*="percent"]').first().text().trim().substring(0, 100));

    // All price-related elements
    $('[class*="price"]').each(function (i) {
        if (i < 10) console.log(`  price-class[${i}]:`, $(this).attr('class'), '->', $(this).text().trim().substring(0, 100));
    });

    // Images
    console.log('\n=== IMAGES ===');
    const imgs = [];
    $('img').each(function () {
        const src = $(this).attr('src') || $(this).attr('data-src');
        if (src && (src.includes('product') || src.includes('upload') || src.includes('media')) && !imgs.includes(src)) {
            imgs.push(src);
        }
    });
    console.log('product images count:', imgs.length);
    imgs.slice(0, 5).forEach(img => console.log(' ', img));

    // Gallery
    console.log('\n=== GALLERY ===');
    $('[class*="gallery"], [class*="slide"], [class*="thumb"], [class*="product-image"]').each(function (i) {
        if (i < 5) console.log(`  gallery[${i}]:`, $(this).attr('class'), '- imgs:', $(this).find('img').length);
    });

    // Description
    console.log('\n=== DESCRIPTION ===');
    const descEl = $('[class*="product-description"], [class*="detail-content"], [class*="product-content"], #product-description, .description');
    console.log('desc sections:', descEl.length);
    if (descEl.length) {
        console.log('desc html length:', descEl.first().html()?.length);
        console.log('desc text (first 300 chars):', descEl.first().text().trim().substring(0, 300));
    }

    // Specs/config table
    console.log('\n=== SPECS ===');
    $('table').each(function (i) {
        if (i < 3) {
            console.log(`table[${i}]:`, $(this).attr('class'));
            $(this).find('tr').each(function (j) {
                if (j < 5) console.log(`  row[${j}]:`, $(this).text().trim().replace(/\s+/g, ' ').substring(0, 150));
            });
        }
    });

    // Breadcrumb
    console.log('\n=== BREADCRUMB ===');
    console.log($('[class*="breadcrumb"], .bread-crumb, .breadcrumb').text().trim().substring(0, 300));

    // Overall page classes
    console.log('\n=== KEY CLASSES ===');
    const classSet = new Set();
    $('[class]').each(function () {
        const cls = $(this).attr('class');
        if (cls && (cls.includes('product') || cls.includes('detail') || cls.includes('price') || cls.includes('config') || cls.includes('spec'))) {
            classSet.add(cls);
        }
    });
    [...classSet].slice(0, 30).forEach(c => console.log('  class:', c));
}

async function scrapeListPage(url) {
    console.log(`\n\n====== SCRAPING LIST PAGE: ${url} ======`);
    const resp = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(resp.data);

    // Find product cards
    console.log('\n=== PRODUCT CARDS ===');
    $('[class*="product-item"], [class*="product_item"], [class*="product-card"], .item').each(function (i) {
        if (i < 3) {
            const cls = $(this).attr('class');
            const name = $(this).find('a[title], h3, h4, .product-name').first().text().trim();
            const price = $(this).find('[class*="price"]').text().trim();
            const link = $(this).find('a').first().attr('href');
            const img = $(this).find('img').first().attr('src') || $(this).find('img').first().attr('data-src');
            console.log(`card[${i}] class: ${cls}`);
            console.log(`  name: ${name}`);
            console.log(`  price: ${price.substring(0, 100)}`);
            console.log(`  link: ${link}`);
            console.log(`  img: ${img}`);
        }
    });

    // Also check for product list container
    $('[class*="product-list"], [class*="productlist"], [class*="list-product"], [class*="product-grid"]').each(function (i) {
        if (i < 3) console.log(`listContainer[${i}]:`, $(this).attr('class'), '- children:', $(this).children().length);
    });

    // Pagination
    console.log('\n=== PAGINATION ===');
    console.log($('[class*="paging"], [class*="pagination"], .pagination').text().trim().substring(0, 200));
    $('[class*="paging"] a, .pagination a').each(function (i) {
        if (i < 5) console.log(`  page[${i}]:`, $(this).attr('href'), $(this).text().trim());
    });
}

(async () => {
    await scrapeProduct('https://pcmarket.vn/pc-gaming-i5-10400f-rtx-3050-dual-oc-6gb');
    await scrapeListPage('https://pcmarket.vn/may-tinh-choi-game-pcm.html');
})().catch(e => console.error('ERROR:', e.message));
