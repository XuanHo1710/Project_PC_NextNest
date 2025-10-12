#!/usr/bin/env node

/**
 * Redis Cache Test Script
 * 
 * This script tests the Redis cache integration for category endpoints
 * 
 * Usage:
 * 1. Make sure Redis is running: docker run -d -p 6379:6379 redis
 * 2. Start the server: npm run start:dev
 * 3. Run this script: node test-redis-cache.js
 */

const BASE_URL = 'http://localhost:8080/api/v1';

async function testCachePerformance() {
    console.log('🧪 Testing Redis Cache Performance\n');
    console.log('='.repeat(60));

    // Test 1: Category Preview (First Request - Cache Miss)
    console.log('\n📋 Test 1: Category Preview - First Request (Cache MISS)');
    const start1 = Date.now();
    const response1 = await fetch(`${BASE_URL}/category/preview`);
    const data1 = await response1.json();
    const time1 = Date.now() - start1;
    console.log(`   ⏱️  Time: ${time1}ms`);
    console.log(`   📊 Categories: ${data1.data?.length || 0}`);

    // Test 2: Category Preview (Second Request - Cache Hit)
    console.log('\n📋 Test 2: Category Preview - Second Request (Cache HIT)');
    const start2 = Date.now();
    const response2 = await fetch(`${BASE_URL}/category/preview`);
    const data2 = await response2.json();
    const time2 = Date.now() - start2;
    console.log(`   ⏱️  Time: ${time2}ms`);
    console.log(`   📊 Categories: ${data2.data?.length || 0}`);
    console.log(`   🚀 Speed Improvement: ${((time1 - time2) / time1 * 100).toFixed(1)}%`);

    // Test 3: Get All Categories (First Request)
    console.log('\n📋 Test 3: Get All Categories - First Request (Cache MISS)');
    const start3 = Date.now();
    const response3 = await fetch(`${BASE_URL}/category`);
    const data3 = await response3.json();
    const time3 = Date.now() - start3;
    console.log(`   ⏱️  Time: ${time3}ms`);
    console.log(`   📊 Categories: ${data3.data?.length || 0}`);

    // Test 4: Get All Categories (Second Request - Cache Hit)
    console.log('\n📋 Test 4: Get All Categories - Second Request (Cache HIT)');
    const start4 = Date.now();
    const response4 = await fetch(`${BASE_URL}/category`);
    const data4 = await response4.json();
    const time4 = Date.now() - start4;
    console.log(`   ⏱️  Time: ${time4}ms`);
    console.log(`   📊 Categories: ${data4.data?.length || 0}`);
    console.log(`   🚀 Speed Improvement: ${((time3 - time4) / time3 * 100).toFixed(1)}%`);

    // Test 5: Get Category by Slug (if you have a category)
    if (data2.data && data2.data[0]?.slug) {
        const slug = data2.data[0].slug;

        console.log(`\n📋 Test 5: Get Category by Slug "${slug}" - First Request (Cache MISS)`);
        const start5 = Date.now();
        const response5 = await fetch(`${BASE_URL}/category/${slug}`);
        const data5 = await response5.json();
        const time5 = Date.now() - start5;
        console.log(`   ⏱️  Time: ${time5}ms`);
        console.log(`   📊 Category: ${data5.data?.name || 'N/A'}`);

        console.log(`\n📋 Test 6: Get Category by Slug "${slug}" - Second Request (Cache HIT)`);
        const start6 = Date.now();
        const response6 = await fetch(`${BASE_URL}/category/${slug}`);
        const data6 = await response6.json();
        const time6 = Date.now() - start6;
        console.log(`   ⏱️  Time: ${time6}ms`);
        console.log(`   📊 Category: ${data6.data?.name || 'N/A'}`);
        console.log(`   🚀 Speed Improvement: ${((time5 - time6) / time5 * 100).toFixed(1)}%`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Cache test completed!\n');
    console.log('💡 Tips:');
    console.log('   - Check server logs for "📦 Cache HIT" and "🔍 Cache MISS" messages');
    console.log('   - Monitor Redis: redis-cli MONITOR');
    console.log('   - Check cache keys: redis-cli KEYS "categories:*"');
    console.log('   - Clear cache: redis-cli FLUSHDB\n');
}

// Run tests
testCachePerformance().catch(console.error);
