const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const seedUsers = [
    {
        name: 'System Administrator',
        email: 'admin@college.edu',
        password: 'Admin123',
        role: 'admin'
    },
    {
        name: 'John Organizer',
        email: 'john.organizer@college.edu',
        password: 'Org123',
        role: 'organizer',
        department: 'Computer Science'
    },
    {
        name: 'Alice Student',
        email: 'alice.student@college.edu',
        password: 'Student123',
        role: 'student',
        studentId: 'CS2021001',
        department: 'Computer Science'
    },
];

const seedEvents = [
    {
        title: 'Annual Tech Fest 2026',
        description: 'Join us for the biggest technology festival featuring workshops, competitions, and exhibitions. This event will showcase the latest innovations in technology and provide networking opportunities for students and professionals.',
        date: new Date('2026-11-15'),
        time: '09:00',
        venue: 'Main Auditorium',
        category: 'Technical',
        capacity: 500,
        registrationDeadline: new Date('2026-10-10'),
        status: 'approved',
        requirements: 'Bring your student ID and laptop for hands-on workshops',
        tags: ['technology', 'workshop', 'competition', 'networking'],
        contactInfo: {
            email: 'techfest@college.edu',
            phone: '+1234567890'
        }
    },
    {
        title: 'Cultural Night Extravaganza',
        description: 'Experience diverse cultures through dance, music, and performances from around the world. A celebration of our multicultural campus community.',
        date: new Date('2026-09-20'),
        time: '18:00',
        venue: 'Open Ground',
        category: 'Cultural',
        capacity: 800,
        registrationDeadline: new Date('2026-08-28'),
        status: 'approved',
        requirements: 'Traditional attire encouraged',
        tags: ['culture', 'dance', 'music', 'international']
    },
    {
        title: 'AI & Machine Learning Workshop',
        description: 'Hands-on workshop covering the fundamentals of AI and practical machine learning applications. Learn from industry experts and work on real projects.',
        date: new Date('2026-07-25'),
        time: '14:00',
        venue: 'Computer Lab 1',
        category: 'Workshop',
        capacity: 50,
        registrationDeadline: new Date('2026-07-22'),
        status: 'pending',
        requirements: 'Basic programming knowledge required, laptops will be provided',
        tags: ['AI', 'machine learning', 'programming', 'workshop']
    },
    {
        title: 'Inter-College Cricket Tournament',
        description: 'Annual cricket championship featuring teams from colleges across the state. Join us for three days of exciting matches.',
        date: new Date('2026-06-30'),
        time: '08:00',
        venue: 'Sports Complex',
        category: 'Sports',
        capacity: 22,
        registrationDeadline: new Date('2026-06-25'),
        status: 'approved',
        requirements: 'Team registration required, bring own equipment',
        tags: ['cricket', 'tournament', 'sports', 'competition']
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://amankumarofficial935_db_user:cms2026@ac-icywfbr-shard-00-00.ppypk8e.mongodb.net:27017,ac-icywfbr-shard-00-01.ppypk8e.mongodb.net:27017,ac-icywfbr-shard-00-02.ppypk8e.mongodb.net:27017/?ssl=true&replicaSet=atlas-13987v-shard-0&authSource=admin&appName=EMS-Cluster0');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Event.deleteMany({});
        await Registration.deleteMany({});
        console.log('🗑️ Cleared existing data');

        // Create users
        console.log('👥 Creating users...');
        const createdUsers = [];

        for (const userData of seedUsers) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
            console.log(`   ✓ Created ${userData.role}: ${userData.email}`);
        }

        // Create events
        console.log('📅 Creating events...');
        const organizer = createdUsers.find(u => u.role === 'organizer');

        for (const eventData of seedEvents) {
            const event = new Event({
                ...eventData,
                organizer: organizer._id,
                organizerName: organizer.name
            });
            await event.save();
            console.log(`   ✓ Created event: ${eventData.title}`);
        }

        // Create some sample registrations
        console.log('📝 Creating sample registrations...');
        const events = await Event.find({ status: 'approved' });
        const students = createdUsers.filter(u => u.role === 'student');

        // Register Alice for Tech Fest
        const techFest = events.find(e => e.title.includes('Tech Fest'));
        if (techFest && students[0]) {
            const registration = new Registration({
                event: techFest._id,
                user: students[0]._id,
                status: 'registered',
                additionalInfo: {
                    dietaryRestrictions: 'Vegetarian',
                    emergencyContact: {
                        name: 'Alice Parent',
                        phone: '+9876543210'
                    }
                }
            });
            await registration.save();
            console.log('   ✓ Registered Alice for Tech Fest');
        }

        // Register Bob for Cultural Night
        const culturalNight = events.find(e => e.title.includes('Cultural'));
        if (culturalNight && students[1]) {
            const registration = new Registration({
                event: culturalNight._id,
                user: students[1]._id,
                status: 'registered'
            });
            await registration.save();
            console.log('   ✓ Registered Bob for Cultural Night');
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('Admin: admin@college.edu / admin123');
        console.log('Organizer: john.organizer@college.edu / organizer123');
        console.log('Student: alice.student@college.edu / student123');
        console.log('Student: bob.student@college.edu / student123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Run the seeder
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };