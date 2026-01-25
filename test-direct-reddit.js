/**
 * Test Direct Reddit Crawler (No OAuth, No RapidAPI)
 * Usage: node test-direct-reddit.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// Test credentials
const LOGIN_EMAIL = 'admin@starreward.com';
const LOGIN_PASSWORD = 'admin123';

async function testDirectReddit() {
    try {
        console.log('🚀 Testing Direct Reddit Crawler...\n');

        // Step 1: Login
        console.log('1️⃣ Logging in as admin...');
        const loginResponse = await axios.post(
            `${BASE_URL}/auth/login`,  // Fixed: /auth/login not /login
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

        const cookies = loginResponse.headers['set-cookie'];
        const cookieHeader = cookies ? cookies.join('; ') : '';

        console.log('✅ Login successful!\n');

        // Step 2: Test fetching from subreddit
        console.log('2️⃣ Fetching from r/parenting (hot, limit: 5)...');
        const fetchResponse = await axios.get(
            `${BASE_URL}/admin/api/reddit-direct?subreddit=parenting&sort=hot&limit=5`,
            {
                headers: {
                    'Cookie': cookieHeader
                }
            }
        );

        console.log('✅ Fetch Response:');
        console.log(`   - Subreddit: r/parenting`);
        console.log(`   - Posts found: ${fetchResponse.data.data.length}`);
        console.log(`   - First post: "${fetchResponse.data.data[0]?.title}"`);
        console.log(`   - Upvotes: ${fetchResponse.data.data[0]?.score}`);
        console.log();

        // Step 3: Test syncing to blog
        console.log('3️⃣ Syncing r/education posts to blog...');
        const syncResponse = await axios.post(
            `${BASE_URL}/admin/api/sync-reddit-direct`,
            {
                subreddit: 'education',
                category: 'education',  // Fixed: use valid category
                sort: 'hot',
                limit: 3,
                timeframe: 'day',
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
        console.log(`   - Subreddit: r/${syncResponse.data.data.subreddit}`);
        console.log(`   - Saved (new): ${syncResponse.data.data.saved.length}`);
        console.log(`   - Updated: ${syncResponse.data.data.updated.length}`);
        console.log(`   - Failed: ${syncResponse.data.data.failed.length}`);
        console.log(`   - Total fetched: ${syncResponse.data.data.total}`);

        if (syncResponse.data.data.saved.length > 0) {
            console.log('\n   Synced posts:');
            syncResponse.data.data.saved.forEach((post, i) => {
                console.log(`   ${i + 1}. ${post.title.substring(0, 60)}...`);
            });
        }

        console.log('\n✅ All tests passed! 🎉');
        console.log('\n🔍 View synced posts at: http://localhost:8080/admin/blog/posts');
        console.log('📊 Test different subreddits: parenting, education, Teachers, homeschool');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        }
        process.exit(1);
    }
}

// Run tests
testDirectReddit();
