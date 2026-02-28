const axios = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'vi-VN,vi;q=0.9',
};

async function main() {
    // 1. Scrape list page structure
    console.log('=== PRODUCT LIST STRUCTURE ===');
    const listResp = await axios.get('https://pcmarket.vn/may-tinh-choi-game-pcm.html', { headers: HEADERS });
    const $list = cheerio.load(listResp.data);

    $list('.product_list .product-item, .product-list-2021 .product-col, .product_list > div').each(function (i) {
        if (i < 3) {
            console.log(`\nproduct[${i}] tag: ${$list(this).prop('tagName')} class: ${$list(this).attr('class')}`);
            console.log('  outerHTML (first 500 chars):', $list(this).html()?.substring(0, 500));
        }
    });

    // Also look at the product list children
    const listContainer = $list('.product_list, .product-list-2021');
    console.log('\n=== LIST CONTAINER CHILDREN ===');
    console.log('children count:', listContainer.children().length);
    listContainer.children().each(function (i) {
        if (i < 3) {
            const tag = $list(this).prop('tagName');
            const cls = $list(this).attr('class');
            const linkEl = $list(this).find('a').first();
            const imgEl = $list(this).find('img').first();
            console.log(`  child[${i}]: <${tag} class="${cls}">`);
            console.log(`    link: ${linkEl.attr('href')}`);
            console.log(`    img: ${imgEl.attr('src') || imgEl.attr('data-src')}`);
            console.log(`    text: ${$list(this).text().trim().substring(0, 200)}`);
        }
    });

    // 2. Scrape product detail - variants and specs
    console.log('\n\n=== PRODUCT DETAIL - VARIANTS ===');
    const prodResp = await axios.get('https://pcmarket.vn/pc-gaming-i5-10400f-rtx-3050-dual-oc-6gb', { headers: HEADERS });
    const $prod = cheerio.load(prodResp.data);

    // Variant selection table
    console.log('\n--- Variant Table ---');
    $prod('.tb-hura8-variant-selection').find('tr').each(function (i) {
        console.log(`  row[${i}]:`);
        $prod(this).find('td, th').each(function (j) {
            const text = $prod(this).text().trim();
            const cls = $prod(this).attr('class');
            const dataVal = $prod(this).attr('data-variant-value') || $prod(this).attr('data-value');
            console.log(`    cell[${j}]: class="${cls}" data="${dataVal}" text="${text.substring(0, 80)}"`);
        });
    });

    // Spec table (component list)
    console.log('\n--- Specs Table ---');
    $prod('table').each(function (i) {
        const cls = $prod(this).attr('class');
        if (cls !== 'tb-hura8-variant-selection') {
            console.log(`  table[${i}] class="${cls}"`);
            $prod(this).find('tr').each(function (j) {
                if (j < 15) {
                    const cells = [];
                    $prod(this).find('td, th').each(function () { cells.push($prod(this).text().trim()); });
                    console.log(`    row[${j}]:`, cells.join(' | '));
                }
            });
        }
    });

    // Product description
    console.log('\n--- Description ---');
    const descContainer = $prod('.pro-desc-container, .pro-info-detail-container');
    console.log('desc containers:', descContainer.length);
    descContainer.each(function (i) {
        const cls = $prod(this).attr('class');
        console.log(`desc[${i}] class="${cls}" html_length:${$prod(this).html()?.length}`);
        if (i === 1) {
            // The second container is usually description
            console.log('desc text (300 chars):', $prod(this).text().trim().substring(0, 300));
        }
    });

    // Images
    console.log('\n--- All product images ---');
    const images = [];
    $prod('.product-info-left img, .gallery img, .slider img, [class*="product-image"] img').each(function () {
        const src = $prod(this).attr('src') || $prod(this).attr('data-src');
        if (src && !images.includes(src)) images.push(src);
    });
    console.log('gallery images:', images);

    // Also check for main product image
    $prod('img[src*="media/product"]').each(function (i) {
        if (i < 8) console.log(`  prod-img[${i}]:`, $prod(this).attr('src'));
    });

    // Check discount/percentage
    console.log('\n--- Discount ---');
    $prod('[class*="percent"], [class*="discount"], [class*="sale-off"]').each(function (i) {
        if (i < 5) console.log(`  discount[${i}]:`, $prod(this).attr('class'), '->', $prod(this).text().trim().substring(0, 100));
    });

    // Price details
    console.log('\n--- Price details ---');
    console.log('sale price:', $prod('.pd-price.js-variant-price').text().trim());
    console.log('market price:', $prod('.pd-market-price').text().trim());
    console.log('hidden price:', $prod('.bk-product-price').text().trim());
}

main().catch(e => console.error('ERROR:', e.message));
