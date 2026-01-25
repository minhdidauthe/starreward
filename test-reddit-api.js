/**
 * Test Reddit API endpoint
 */

const directRedditCrawler = require('./src/services/directRedditCrawler');

async function testRedditAPI() {
    try {
        console.log('🧪 Testing Reddit Direct Crawler API...\n');

        // Test 1: Fetch from r/parenting
        console.log('Test 1: Fetching 5 posts from r/parenting (hot)');
        const posts1 = await directRedditCrawler.fetchSubredditPosts('parenting', {
            sort: 'hot',
            limit: 5
        });
        console.log(`✅ Success: Fetched ${posts1.length} posts`);
        if (posts1.length > 0) {
            console.log(`   Sample: "${posts1[0].title}"`);
        }
        console.log('');

        // Test 2: Fetch from r/education
        console.log('Test 2: Fetching 3 posts from r/education (new)');
        const posts2 = await directRedditCrawler.fetchSubredditPosts('education', {
            sort: 'new',
            limit: 3
        });
        console.log(`✅ Success: Fetched ${posts2.length} posts`);
        console.log('');

        // Test 3: Fetch from r/Teachers
        console.log('Test 3: Fetching 3 posts from r/Teachers (top/week)');
        const posts3 = await directRedditCrawler.fetchSubredditPosts('Teachers', {
            sort: 'top',
            limit: 3,
            timeframe: 'week'
        });
        console.log(`✅ Success: Fetched ${posts3.length} posts`);
        console.log('');

        console.log('🎉 All tests passed!');
        console.log('\n📊 Summary:');
        console.log(`   r/parenting: ${posts1.length} posts`);
        console.log(`   r/education: ${posts2.length} posts`);
        console.log(`   r/Teachers: ${posts3.length} posts`);
        console.log(`   Total: ${posts1.length + posts2.length + posts3.length} posts`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    }
}

testRedditAPI();
