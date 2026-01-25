/**
 * Test syncing Reddit posts to MongoDB
 */

const mongoose = require('mongoose');
const directRedditCrawler = require('./src/services/directRedditCrawler');
const { BlogPost } = require('./src/models/Blog');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/star_reward_app';

async function testSync() {
    try {
        console.log('🚀 Testing Reddit Sync to Database...\n');

        // Connect to MongoDB
        console.log('1️⃣ Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Fetch posts from r/parenting
        console.log('2️⃣ Fetching posts from r/parenting...');
        const posts = await directRedditCrawler.fetchSubredditPosts('parenting', {
            sort: 'hot',
            limit: 3
        });
        console.log(`✅ Fetched ${posts.length} posts\n`);

        // Sync to database
        console.log('3️⃣ Syncing to database...');
        const saved = [];
        const updated = [];
        const failed = [];

        for (const post of posts) {
            try {
                const blogPostData = directRedditCrawler.convertToBlogPost(post, {
                    category: 'experience',
                    autoPublish: false
                });

                // Check for duplicates
                const existing = await BlogPost.findOne({
                    'metadata.redditUrl': blogPostData.metadata.redditUrl
                });

                if (existing) {
                    console.log(`   ↻ Updating: "${post.title.substring(0, 50)}..."`);
                    Object.assign(existing, blogPostData);
                    existing.updatedAt = new Date();
                    await existing.save();
                    updated.push(existing);
                } else {
                    console.log(`   ✓ Creating: "${post.title.substring(0, 50)}..."`);
                    const newPost = await BlogPost.create(blogPostData);
                    saved.push(newPost);
                }

            } catch (error) {
                console.log(`   ✗ Failed: "${post.title.substring(0, 50)}..." - ${error.message}`);
                failed.push({ title: post.title, error: error.message });
            }
        }

        console.log('\n✅ Sync completed!\n');
        console.log('📊 Results:');
        console.log(`   - New posts created: ${saved.length}`);
        console.log(`   - Existing posts updated: ${updated.length}`);
        console.log(`   - Failed: ${failed.length}`);
        console.log(`   - Total processed: ${posts.length}`);

        if (saved.length > 0) {
            console.log('\n📝 New posts:');
            saved.forEach((post, i) => {
                console.log(`   ${i + 1}. ${post.title} (${post.category})`);
            });
        }

        if (updated.length > 0) {
            console.log('\n🔄 Updated posts:');
            updated.forEach((post, i) => {
                console.log(`   ${i + 1}. ${post.title}`);
            });
        }

        if (failed.length > 0) {
            console.log('\n❌ Failed posts:');
            failed.forEach((item, i) => {
                console.log(`   ${i + 1}. ${item.title}: ${item.error}`);
            });
        }

        console.log('\n✅ Test completed successfully! 🎉');
        console.log('🔍 View posts at: http://localhost:8080/admin/blog/posts');

        // Close connection
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
testSync();
