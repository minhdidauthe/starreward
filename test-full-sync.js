/**
 * Full test - Sync from multiple subreddits
 */

const mongoose = require('mongoose');
const directRedditCrawler = require('./src/services/directRedditCrawler');
const { BlogPost } = require('./src/models/Blog');

const MONGODB_URI = 'mongodb://localhost:27017/star_reward_app';

const SUBREDDITS = [
    { name: 'parenting', category: 'experience', limit: 3 },
    { name: 'education', category: 'education', limit: 3 },
    { name: 'Teachers', category: 'education', limit: 2 },
    { name: 'homeschool', category: 'education', limit: 2 }
];

async function fullTest() {
    try {
        console.log('🚀 Full Reddit Sync Test - Multiple Subreddits\n');
        console.log('=' .repeat(60));

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        let totalSaved = 0;
        let totalUpdated = 0;
        let totalFailed = 0;
        let totalProcessed = 0;

        // Process each subreddit
        for (const config of SUBREDDITS) {
            console.log(`\n📡 Processing r/${config.name}...`);
            console.log('-'.repeat(60));

            try {
                // Fetch posts
                const posts = await directRedditCrawler.fetchSubredditPosts(config.name, {
                    sort: 'hot',
                    limit: config.limit
                });

                console.log(`   Fetched: ${posts.length} posts`);

                // Sync each post
                for (const post of posts) {
                    try {
                        const blogPostData = directRedditCrawler.convertToBlogPost(post, {
                            category: config.category,
                            autoPublish: false
                        });

                        const existing = await BlogPost.findOne({
                            'metadata.redditUrl': blogPostData.metadata.redditUrl
                        });

                        if (existing) {
                            Object.assign(existing, blogPostData);
                            existing.updatedAt = new Date();
                            await existing.save();
                            console.log(`   ↻ Updated: "${post.title.substring(0, 45)}..."`);
                            totalUpdated++;
                        } else {
                            await BlogPost.create(blogPostData);
                            console.log(`   ✓ Created: "${post.title.substring(0, 45)}..."`);
                            totalSaved++;
                        }

                        totalProcessed++;

                    } catch (error) {
                        console.log(`   ✗ Failed: "${post.title.substring(0, 45)}..." - ${error.message}`);
                        totalFailed++;
                    }
                }

            } catch (error) {
                console.log(`   ❌ Error fetching r/${config.name}: ${error.message}`);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 FINAL SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ New posts created:        ${totalSaved}`);
        console.log(`🔄 Existing posts updated:   ${totalUpdated}`);
        console.log(`❌ Failed:                   ${totalFailed}`);
        console.log(`📝 Total processed:          ${totalProcessed}`);
        console.log('='.repeat(60));

        // Count posts in database
        const totalInDb = await BlogPost.countDocuments({ 'metadata.source': 'reddit' });
        console.log(`\n💾 Total Reddit posts in database: ${totalInDb}`);

        console.log('\n✅ Full test completed successfully! 🎉');
        console.log('🔍 View all posts at: http://localhost:8080/admin/blog/posts');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

// Run test
fullTest();
