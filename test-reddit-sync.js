/**
 * Test script for Reddit Sync API
 * Usage: node test-reddit-sync.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// Test credentials (admin account)
const LOGIN_EMAIL = 'admin@starreward.com';
const LOGIN_PASSWORD = 'admin123';

async function testRedditSync() {
    try {
        console.log('🚀 Testing Reddit Sync API...\n');

        // Step 1: Login to get session cookie
        console.log('1️⃣ Logging in as admin...');
        const loginResponse = await axios.post(
            `${BASE_URL}/login`,
            new URLSearchParams({
                email: LOGIN_EMAIL,
                password: LOGIN_PASSWORD
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                maxRedirects: 0,
                validateStatus: (status) => status >= 200 && status < 400
            }
        );

        // Extract cookies
        const cookies = loginResponse.headers['set-cookie'];
        const cookieHeader = cookies ? cookies.join('; ') : '';

        console.log('✅ Login successful!\n');

        // Step 2: Test fetching Reddit trends
        console.log('2️⃣ Fetching Reddit trends (limit: 5)...');
        const trendsResponse = await axios.get(
            `${BASE_URL}/admin/api/reddit-trends?limit=5`,
            {
                headers: {
                    'Cookie': cookieHeader
                }
            }
        );

        console.log('✅ Reddit Trends Response:');
        console.log(JSON.stringify(trendsResponse.data, null, 2));
        console.log(`\n📊 Found ${trendsResponse.data.data.length} trending memes\n`);

        // Step 3: Test syncing to blog
        console.log('3️⃣ Syncing Reddit trends to blog posts...');
        const syncResponse = await axios.post(
            `${BASE_URL}/admin/api/sync-reddit-trends`,
            {
                category: 'entertainment',
                limit: 5,
                autoPublish: false  // Save as draft
            },
            {
                headers: {
                    'Cookie': cookieHeader,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Sync Response:');
        console.log(JSON.stringify(syncResponse.data, null, 2));
        console.log(`\n📝 Saved: ${syncResponse.data.data.saved.length}`);
        console.log(`📝 Updated: ${syncResponse.data.data.updated.length}`);
        console.log(`❌ Failed: ${syncResponse.data.data.failed.length}`);

        console.log('\n✅ All tests passed! 🎉');
        console.log('\n🔍 View synced posts at: http://localhost:8080/admin/blog/posts');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        process.exit(1);
    }
}

// Run tests
testRedditSync();
