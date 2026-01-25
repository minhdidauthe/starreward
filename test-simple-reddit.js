/**
 * Simple test for Direct Reddit Crawler
 * Test directly without API endpoints
 */

const directRedditCrawler = require('./src/services/directRedditCrawler');

async function simpleTest() {
    try {
        console.log('🧪 Testing Direct Reddit Crawler Service...\n');

        // Test 1: Fetch from r/parenting
        console.log('1️⃣ Fetching from r/parenting...');
        const parentingPosts = await directRedditCrawler.fetchSubredditPosts('parenting', {
            sort: 'hot',
            limit: 5
        });

        console.log(`✅ Success! Found ${parentingPosts.length} posts from r/parenting`);
        if (parentingPosts.length > 0) {
            console.log(`   First post: "${parentingPosts[0].title}"`);
            console.log(`   Upvotes: ${parentingPosts[0].score}`);
            console.log(`   Comments: ${parentingPosts[0].num_comments}`);
            console.log(`   Author: u/${parentingPosts[0].author}`);
        }
        console.log();

        // Test 2: Fetch from r/education
        console.log('2️⃣ Fetching from r/education...');
        const educationPosts = await directRedditCrawler.fetchSubredditPosts('education', {
            sort: 'hot',
            limit: 3
        });

        console.log(`✅ Success! Found ${educationPosts.length} posts from r/education`);
        if (educationPosts.length > 0) {
            console.log(`   First post: "${educationPosts[0].title}"`);
            console.log(`   Upvotes: ${educationPosts[0].score}`);
        }
        console.log();

        // Test 3: Convert to blog post format
        console.log('3️⃣ Converting first post to BlogPost format...');
        if (parentingPosts.length > 0) {
            const blogPost = directRedditCrawler.convertToBlogPost(parentingPosts[0], {
                category: 'experience',
                autoPublish: false
            });

            console.log('✅ Converted successfully!');
            console.log(`   Title: ${blogPost.title}`);
            console.log(`   Category: ${blogPost.category}`);
            console.log(`   Status: ${blogPost.status}`);
            console.log(`   Tags: ${blogPost.tags.slice(0, 5).join(', ')}`);
            console.log(`   Trending Score: ${blogPost.metadata.trendingScore}`);
            console.log(`   Priority: ${blogPost.metadata.priority}`);
        }
        console.log();

        // Test 4: Fetch from r/Teachers
        console.log('4️⃣ Fetching from r/Teachers...');
        const teachersPosts = await directRedditCrawler.fetchSubredditPosts('Teachers', {
            sort: 'top',
            limit: 3,
            timeframe: 'day'
        });

        console.log(`✅ Success! Found ${teachersPosts.length} top posts from r/Teachers (today)`);
        teachersPosts.forEach((post, i) => {
            console.log(`   ${i + 1}. "${post.title.substring(0, 60)}..." (${post.score} upvotes)`);
        });
        console.log();

        console.log('✅ All tests passed! 🎉\n');
        console.log('📊 Summary:');
        console.log(`   - r/parenting: ${parentingPosts.length} posts`);
        console.log(`   - r/education: ${educationPosts.length} posts`);
        console.log(`   - r/Teachers: ${teachersPosts.length} posts`);
        console.log(`   - Total: ${parentingPosts.length + educationPosts.length + teachersPosts.length} posts fetched`);
        console.log('\n✅ Direct Reddit Crawler is working perfectly!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
        }
        process.exit(1);
    }
}

// Run test
simpleTest();
