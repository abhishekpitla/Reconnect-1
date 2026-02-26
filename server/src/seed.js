require('dotenv').config();
const { sequelize } = require('./config/db');
const { User, Activity, Connection, Engagement, Notification } = require('./models');

const seedData = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL');

        // Force sync - recreate all tables
        await sequelize.sync({ force: true });
        console.log('🧹 Recreated all tables');

        // Create 5 sample users (password hashing handled by hook)
        const users = await Promise.all([
            User.create({
                name: 'Alex Johnson',
                email: 'alex@reconnect.app',
                password: 'password123',
                bio: 'Love hiking, photography, and spontaneous road trips. Always down for an adventure! 🏔️',
                profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
            }),
            User.create({
                name: 'Maya Patel',
                email: 'maya@reconnect.app',
                password: 'password123',
                bio: 'Coffee enthusiast ☕ | Yoga instructor | Book lover. Looking to reconnect with old college friends!',
                profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maya',
            }),
            User.create({
                name: 'Jordan Lee',
                email: 'jordan@reconnect.app',
                password: 'password123',
                bio: 'Tech professional by day, musician by night 🎸. Miss my high school band crew!',
                profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan',
            }),
            User.create({
                name: 'Sam Rivera',
                email: 'sam@reconnect.app',
                password: 'password123',
                bio: 'Former soccer player, now coaching kids ⚽. Would love to reconnect with teammates.',
                profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sam',
            }),
            User.create({
                name: 'Taylor Chen',
                email: 'taylor@reconnect.app',
                password: 'password123',
                bio: 'Foodie 🍜 | Travel blogger | Always planning the next trip. Who wants to join?',
                profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Taylor',
            }),
        ]);

        console.log('👤 Created 5 sample users');

        // Create connections
        await Promise.all([
            Connection.create({ requesterId: users[0].id, recipientId: users[1].id, status: 'accepted' }),
            Connection.create({ requesterId: users[0].id, recipientId: users[2].id, status: 'accepted' }),
            Connection.create({ requesterId: users[1].id, recipientId: users[3].id, status: 'accepted' }),
            Connection.create({ requesterId: users[2].id, recipientId: users[4].id, status: 'accepted' }),
            Connection.create({ requesterId: users[3].id, recipientId: users[0].id, status: 'accepted' }),
            Connection.create({ requesterId: users[4].id, recipientId: users[1].id, status: 'pending' }),
        ]);

        console.log('🤝 Created connections');

        const now = new Date();
        const activities = await Promise.all([
            Activity.create({
                userId: users[0].id,
                title: 'Weekend Hiking at Blue Ridge',
                description: 'Planning a trail hike this Saturday. We\'ll hit the 5-mile loop and grab lunch after. All skill levels welcome!',
                location: 'Blue Ridge Mountains, NC',
                time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
                audience: 'friends',
            }),
            Activity.create({
                userId: users[1].id,
                title: 'Free Yoga in the Park',
                description: 'Hosting a free outdoor yoga session for beginners. Bring your mat and a smile 🧘‍♀️',
                location: 'Central Park, NYC',
                time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
                audience: 'public',
            }),
            Activity.create({
                userId: users[2].id,
                title: 'Open Mic Night',
                description: 'Playing at The Blue Note this Friday! Come jam or just listen. Would love to see some familiar faces.',
                location: 'The Blue Note, Chicago',
                time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
                audience: 'friends',
            }),
            Activity.create({
                userId: users[3].id,
                title: 'Youth Soccer Tournament',
                description: 'My team is competing this weekend. Come support the kids ⚽! Would be amazing to see old teammates.',
                location: 'Riverside Sports Complex',
                time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
                audience: 'public',
            }),
            Activity.create({
                userId: users[4].id,
                title: 'Food Tour: Best Ramen in Town',
                description: 'Hitting 3 ramen spots in one afternoon. Who\'s in? 🍜 Rating them all on my blog.',
                location: 'Downtown LA',
                time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
                audience: 'public',
            }),
            Activity.create({
                userId: users[0].id,
                title: 'Board Game Night',
                description: 'Having a chill board game night at my place. Bringing out Catan, Ticket to Ride, and more!',
                location: 'My apartment, Austin TX',
                time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                audience: 'friends',
            }),
        ]);

        console.log('📢 Created 6 sample activities');

        await Promise.all([
            Engagement.create({ userId: users[1].id, activityId: activities[0].id, type: 'interested' }),
            Engagement.create({ userId: users[2].id, activityId: activities[0].id, type: 'me_too' }),
            Engagement.create({ userId: users[0].id, activityId: activities[1].id, type: 'interested' }),
            Engagement.create({ userId: users[3].id, activityId: activities[1].id, type: 'me_too' }),
            Engagement.create({ userId: users[0].id, activityId: activities[2].id, type: 'interested' }),
            Engagement.create({ userId: users[4].id, activityId: activities[3].id, type: 'interested' }),
        ]);

        console.log('❤️ Created sample engagements');

        await Promise.all([
            Notification.create({
                userId: users[0].id,
                type: 'engagement',
                relatedActivityId: activities[0].id,
                relatedUserId: users[1].id,
                message: 'Maya Patel is interested in your activity "Weekend Hiking at Blue Ridge"',
            }),
            Notification.create({
                userId: users[0].id,
                type: 'engagement',
                relatedActivityId: activities[0].id,
                relatedUserId: users[2].id,
                message: 'Jordan Lee reacted "Me Too!" to your activity "Weekend Hiking at Blue Ridge"',
            }),
            Notification.create({
                userId: users[1].id,
                type: 'new_activity',
                relatedActivityId: activities[0].id,
                relatedUserId: users[0].id,
                message: 'Alex Johnson posted a new activity: "Weekend Hiking at Blue Ridge"',
            }),
        ]);

        console.log('🔔 Created sample notifications');

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📧 Login credentials (password: password123 for all):');
        users.forEach((u) => console.log(`   - ${u.name}: ${u.email}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
