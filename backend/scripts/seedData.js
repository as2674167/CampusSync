const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notice = require('../models/Notice');
const Gallery = require('../models/Gallery');

// ---------------------------------------------------------------------------
// USERS
// ---------------------------------------------------------------------------
const seedUsers = [
  {
    name: 'System Administrator',
    email: 'admin@college.edu',
    password: 'Admin123',
    role: 'admin',
  },
  {
    name: 'John Organizer',
    email: 'john.organizer@college.edu',
    password: 'Org123',
    role: 'organizer',
    department: 'Computer Science',
  },
  {
    name: 'Alice Student',
    email: 'alice.student@college.edu',
    password: 'Student123',
    role: 'student',
    studentId: 'CS2021001',
    department: 'Computer Science',
  },
  {
    // 👇 this fixes the “Bob Student” reference in your original script
    name: 'Bob Student',
    email: 'bob.student@college.edu',
    password: 'Student123',
    role: 'student',
    studentId: 'CS2021002',
    department: 'Mechanical Engineering',
  },
];

// ---------------------------------------------------------------------------
// EVENTS (with image field filled)
// Event.category must use: Academic, Cultural, Sports, Technical, Workshop,
// Seminar, Competition   (as per Event schema)
// ---------------------------------------------------------------------------
const seedEvents = [
  {
    title: 'Annual Tech Fest 2026',
    description:
      'Join us for the biggest technology festival featuring workshops, competitions, and exhibitions. This event will showcase the latest innovations in technology and provide networking opportunities for students and professionals.',
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
      phone: '+1234567890',
    },
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D ',
  },
  {
    title: 'Cultural Night Extravaganza',
    description:
      'Experience diverse cultures through dance, music, and performances from around the world. A celebration of our multicultural campus community.',
    date: new Date('2026-09-20'),
    time: '18:00',
    venue: 'Open Ground',
    category: 'Cultural',
    capacity: 800,
    registrationDeadline: new Date('2026-08-28'),
    status: 'approved',
    requirements: 'Traditional attire encouraged',
    tags: ['culture', 'dance', 'music', 'international'],
    contactInfo: {
      email: 'cultural@college.edu',
      phone: '+1234567891',
    },
    image:
      'https://media.gettyimages.com/id/528153683/photo/west-end-people-in-leicester-square.jpg?s=612x612&w=0&k=20&c=4PuMQn46IBFx0WcSX7eiuqGiqcAkAdDeaDBRUZ6mE1c=',
  },
  {
    title: 'AI & Machine Learning Workshop',
    description:
      'Hands-on workshop covering the fundamentals of AI and practical machine learning applications. Learn from industry experts and work on real projects.',
    date: new Date('2026-07-25'),
    time: '14:00',
    venue: 'Computer Lab 1',
    category: 'Workshop',
    capacity: 50,
    registrationDeadline: new Date('2026-07-22'),
    status: 'pending',
    requirements:
      'Basic programming knowledge required, laptops will be provided',
    tags: ['AI', 'machine learning', 'programming', 'workshop'],
    contactInfo: {
      email: 'ai-workshop@college.edu',
      phone: '+1234567892',
    },
    image:
      'https://imgs.search.brave.com/A9WyiG00JkkLkjWKmH2SVqfIgDNRL8ZURhwO_EjWi-w/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9sc2V0/LnVrL3dwLWNvbnRl/bnQvdXBsb2Fkcy8y/MDI1LzAzL01hY2hp/bmUtTGVhcm5pbmct/aW4tSGVhbHRoY2Fy/ZS1Xb3Jrc2hvcC1J/bWcuanBn',
  },
  {
    title: 'Inter-College Cricket Tournament',
    description:
      'Annual cricket championship featuring teams from colleges across the state. Join us for three days of exciting matches.',
    date: new Date('2026-06-30'),
    time: '08:00',
    venue: 'Sports Complex',
    category: 'Sports',
    capacity: 22,
    registrationDeadline: new Date('2026-06-25'),
    status: 'approved',
    requirements: 'Team registration required, bring own equipment',
    tags: ['cricket', 'tournament', 'sports', 'competition'],
    contactInfo: {
      email: 'sports@college.edu',
      phone: '+1234567893',
    },
    image:
      'https://imgs.search.brave.com/27NIKF1WbJlqITRflSRnL93XNczVPhgRDzSs4S-9Evw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/YXNocmFlLm9yZy9p/bWFnZSUyMGxpYnJh/cnkvbWFpbiUyMG5h/di90ZWNobmljYWwl/MjByZXNvdXJjZXMv/YXNocmFlJTIwam91/cm5hbC9jcmlja2V0/LTIuanBn',
  },
];

// ---------------------------------------------------------------------------
// NOTICES
// Matches Notice schema: title, content, category, priority, expiresAt, createdBy
// category: ['general', 'event', 'academic', 'urgent']
// priority: ['low', 'medium', 'high']
// createdBy filled inside seedDatabase once users are created.
// ---------------------------------------------------------------------------
const seedNotices = [
  {
    title: 'Mid-Semester Examination Schedule Published',
    content:
      'The detailed timetable for mid-semester examinations (B.Tech all branches) has been uploaded on the college portal. Students are advised to check their respective course codes and report 15 minutes before the exam time.',
    category: 'academic',
    priority: 'high',
    expiresAt: new Date('2026-05-15'),
  },
  {
    title: 'Registrations Open: Annual Tech Fest 2026',
    content:
      'Online registrations for the Annual Tech Fest 2026 are now open on CampusSync. Teams and individuals can register for hackathons, coding contests, and project exhibitions until 10 October 2026.',
    category: 'event',
    priority: 'high',
    expiresAt: new Date('2026-10-11'),
  },
  {
    title: 'Maintenance Window for Campus Network',
    content:
      'The campus Wi‑Fi and LAN services will be unavailable on 30 April 2026 from 01:00 AM to 04:00 AM due to scheduled maintenance. Please save your work and log out of critical systems in advance.',
    category: 'urgent',
    priority: 'high',
    expiresAt: new Date('2026-05-01'),
  },
  {
    title: 'New Student Clubs Onboarding',
    content:
      'Student Affairs invites proposals for new technical, cultural, and sports clubs for the upcoming academic year. Interested students can submit proposals through CampusSync under the “Clubs & Societies” section.',
    category: 'general',
    priority: 'medium',
    expiresAt: null,
  },
];

// ---------------------------------------------------------------------------
// GALLERY
// Matches Gallery schema: title, description, imageUrl, imageFileId, thumbnailUrl,
// uploader, uploaderName, uploaderRole, event (optional), tags, likes, likeCount.
// imageFileId is just a placeholder here (ImageKit won’t actually have these).
// We link images to events by title keywords.
// ---------------------------------------------------------------------------
function buildSeedGallery(organizer, admin, createdEvents) {
  const findEvent = (keyword) =>
    createdEvents.find((e) => e.title.toLowerCase().includes(keyword));

  const techFest = findEvent('tech fest');
  const cultural = findEvent('cultural');
  const cricket = findEvent('cricket');

  const docs = [];

  if (techFest) {
    docs.push(
      {
        title: 'Tech Fest Opening Ceremony',
        description: 'Crowd gathered in the main auditorium for the grand opening.',
        imageUrl:
          'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        imageFileId: 'seed-techfest-1',
        uploader: organizer._id,
        uploaderName: organizer.name,
        uploaderRole: organizer.role,
        event: techFest._id,
        tags: ['techfest', 'opening', 'stage', 'auditorium'],
      },
      {
        title: 'AI Hackathon Floor',
        description: 'Participants working on AI & ML challenges throughout the night.',
        imageUrl:
          'https://imgs.search.brave.com/UWTc1RgJNXJ2F47gx-utNqx1Ggv8HR2jWEsYbacGgbI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9ha20t/aW1nLWEtaW4udG9z/c2h1Yi5jb20vaW5k/aWF0b2RheS9zdHls/ZXMvbWVkaXVtX2Ny/b3Bfc2ltcGxlL3B1/YmxpYy8yMDI2LTAz/L2FkdWx0LWJhci1i/cmFpbnN0b3JtaW5n/LTEwMTU1NjguanBn/P1ZlcnNpb25JZD1H/eThZeWJMWS50WUM3/ZjI2NzVUWDFuWVRz/SHU2M0U3RyZzaXpl/PTc1MDoq',
        thumbnailUrl:
          'https://imgs.search.brave.com/UWTc1RgJNXJ2F47gx-utNqx1Ggv8HR2jWEsYbacGgbI/rs:fit:400:300:1:0/g:ce/aHR0cHM6Ly9ha20t/aW1nLWEtaW4udG9z/c2h1Yi5jb20vaW5k/aWF0b2RheS9zdHls/ZXMvbWVkaXVtX2Ny/b3Bfc2ltcGxlL3B1/YmxpYy8yMDI2LTAz/L2FkdWx0LWJhci1i/cmFpbnN0b3JtaW5n/LTEwMTU1NjguanBn/P1ZlcnNpb25JZD1H/eThZeWJMWS50WUM3/ZjI2NzVUWDFuWVRz/SHU2M0U3RyZzaXpl/PTc1MDoq',
        imageFileId: 'seed-techfest-2',
        uploader: organizer._id,
        uploaderName: organizer.name,
        uploaderRole: organizer.role,
        event: techFest._id,
        tags: ['hackathon', 'coding', 'ai', 'night'],
      }
    );
  }

  if (cultural) {
    docs.push(
      {
        title: 'Cultural Night Performances',
        description: 'Students performing traditional dance on the main stage.',
        imageUrl:
          'https://imgs.search.brave.com/hmK0LjAtIgC3Y4HV0RU_jktdXE6SceTAjjW2QoRcqiQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wdWJs/aWN3ZWJzaXRlLW1l/ZGlhLmFwdS5lZHUu/bXkvYXNzZXRzL2lu/bGluZS1pbWFnZXMv/QVBVJTIwMTAlMjAo/SW50ZXJuYXRpb25h/bCUyMEN1bHR1cmFs/JTIwTmlnaHQlMjAy/MDI0KS5qcGc_VmVy/c2lvbklkPWJPMHpl/QTNtMV83SjY1T01U/d3lpaEI4MlV5OUxx/QVBp',
        thumbnailUrl:
          'https://imgs.search.brave.com/hmK0LjAtIgC3Y4HV0RU_jktdXE6SceTAjjW2QoRcqiQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wdWJs/aWN3ZWJzaXRlLW1l/ZGlhLmFwdS5lZHUu/bXkvYXNzZXRzL2lu/bGluZS1pbWFnZXMv/QVBVJTIwMTAlMjAo/SW50ZXJuYXRpb25h/bCUyMEN1bHR1cmFs/JTIwTmlnaHQlMjAy/MDI0KS5qcGc_VmVy/c2lvbklkPWJPMHpl/QTNtMV83SjY1T01U/d3lpaEI4MlV5OUxx/QVBp',
        imageFileId: 'seed-cultural-1',
        uploader: organizer._id,
        uploaderName: organizer.name,
        uploaderRole: organizer.role,
        event: cultural._id,
        tags: ['cultural', 'dance', 'music', 'stage'],
      },
      {
        title: 'Food Stalls at Cultural Night',
        description: 'Students enjoying regional delicacies at the open ground.',
        imageUrl:
          'https://imgs.search.brave.com/-eA96toaoHyLjZuGkzsnJJPShbP8W6u84OAsBZPurak/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/bG9zdGluY24uY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDI1/LzEwL2NoaW5hLW5p/Z2h0LW1hcmtldC1Y/aWFuLU11c2xpbS1R/dWFydGVyLTEwMjR4/NjI0LmpwZw',
        thumbnailUrl:
          'https://imgs.search.brave.com/-eA96toaoHyLjZuGkzsnJJPShbP8W6u84OAsBZPurak/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/bG9zdGluY24uY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDI1/LzEwL2NoaW5hLW5p/Z2h0LW1hcmtldC1Y/aWFuLU11c2xpbS1R/dWFydGVyLTEwMjR4/NjI0LmpwZw',
        imageFileId: 'seed-cultural-2',
        uploader: organizer._id,
        uploaderName: organizer.name,
        uploaderRole: organizer.role,
        event: cultural._id,
        tags: ['food', 'stalls', 'night', 'festival'],
      }
    );
  }

  if (cricket) {
    docs.push(
      {
        title: 'Cricket Tournament Toss',
        description: 'Captains and umpires at the toss on the first day.',
        imageUrl:
          'https://imgs.search.brave.com/TOHd_Q1DxL2RSWGrds70sJPYaB1QrlPbK_czyUPONvE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTg4/ODQ5MC9waG90by9q/b2hhbm5lc2J1cmct/Y2FwdGFpbnMtcmlj/a3ktcG9udGluZy1v/Zi1hdXN0cmFsaWEt/YW5kLXNvdXJhdi1n/YW5ndWx5LW9mLWlu/ZGlhLWR1cmluZy10/aGUtY29pbi5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9OV8w/X1AwX0pzcWZ4Mmwz/TWZfMG13cERPTlcy/RlJvUUtLbWx6aUN2/LWJobz0',
        thumbnailUrl:
          'https://imgs.search.brave.com/TOHd_Q1DxL2RSWGrds70sJPYaB1QrlPbK_czyUPONvE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTg4/ODQ5MC9waG90by9q/b2hhbm5lc2J1cmct/Y2FwdGFpbnMtcmlj/a3ktcG9udGluZy1v/Zi1hdXN0cmFsaWEt/YW5kLXNvdXJhdi1n/YW5ndWx5LW9mLWlu/ZGlhLWR1cmluZy10/aGUtY29pbi5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9OV8w/X1AwX0pzcWZ4Mmwz/TWZfMG13cERPTlcy/RlJvUUtLbWx6aUN2/LWJobz0',
        imageFileId: 'seed-cricket-1',
        uploader: admin._id,
        uploaderName: admin.name,
        uploaderRole: admin.role,
        event: cricket._id,
        tags: ['cricket', 'sports', 'tournament', 'toss'],
      },
      {
        title: 'Final Match Crowd',
        description: 'Students cheering for their favourite team in the stands.',
        imageUrl:
          'https://imgs.search.brave.com/ldascfGdSQGaRIfXRIiaeMfSWH39DeOkgExiPTPa03Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTUy/NDg0Njc2OS9waG90/by90YXVudG9uLWVu/Z2xhbmQtc3BlY3Rh/dG9ycy1yZWFjdC1p/bi10aGUtY3Jvd2Qt/ZHVyaW5nLXRoZS12/aXRhbGl0eS1ibGFz/dC10MjAtcXVhcnRl/ci1maW5hbC5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9Y3E4/aDVnZF9rSWFhTjJa/OWE1d2JRNS03VHV4/dHFqdkQ3b3RhYXVE/NWNHND0',
        thumbnailUrl:
          'https://imgs.search.brave.com/ldascfGdSQGaRIfXRIiaeMfSWH39DeOkgExiPTPa03Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTUy/NDg0Njc2OS9waG90/by90YXVudG9uLWVu/Z2xhbmQtc3BlY3Rh/dG9ycy1yZWFjdC1p/bi10aGUtY3Jvd2Qt/ZHVyaW5nLXRoZS12/aXRhbGl0eS1ibGFz/dC10MjAtcXVhcnRl/ci1maW5hbC5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9Y3E4/aDVnZF9rSWFhTjJa/OWE1d2JRNS03VHV4/dHFqdkQ3b3RhYXVE/NWNHND0',
        imageFileId: 'seed-cricket-2',
        uploader: admin._id,
        uploaderName: admin.name,
        uploaderRole: admin.role,
        event: cricket._id,
        tags: ['final', 'crowd', 'cheering'],
      }
    );
  }

  // A couple of generic campus photos not linked to a specific event
  docs.push(
    {
      title: 'Campus Library Evening View',
      description: 'Students studying in the library during exam preparation weeks.',
      imageUrl:
        'https://imgs.search.brave.com/sElL3CvlsudE57KDH3goE7jaTNagCXSHYxQunmMDjiw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNTE4/NzU3ODgvcGhvdG8v/c3RhbmZvcmQtY2Et/YS1yZWFkaW5nLXJv/b20taXMtc2Vlbi1h/dC10aGUtY2VjaWwt/aC1ncmVlbi1saWJy/YXJ5LW9uLXRoZS1z/dGFuZm9yZC11bml2/ZXJzaXR5LmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1MOFEz/ZGR4Q25TcDZpekht/UTBwMWUzcXJNV0pF/b3pvRVRTYWV5dUlP/WFBjPQ',
      thumbnailUrl:
        'https://imgs.search.brave.com/sElL3CvlsudE57KDH3goE7jaTNagCXSHYxQunmMDjiw/rs:fit:400:300:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNTE4/NzU3ODgvcGhvdG8v/c3RhbmZvcmQtY2Et/YS1yZWFkaW5nLXJv/b20taXMtc2Vlbi1h/dC10aGUtY2VjaWwt/aC1ncmVlbi1saWJy/YXJ5LW9uLXRoZS1z/dGFuZm9yZC11bml2/ZXJzaXR5LmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1MOFEz/ZGR4Q25TcDZpekht/UTBwMWUzcXJNV0pF/b3pvRVRTYWV5dUlP/WFBjPQ',
      imageFileId: 'seed-campus-1',
      uploader: admin._id,
      uploaderName: admin.name,
      uploaderRole: admin.role,
      event: null,
      tags: ['library', 'campus', 'study'],
    },
    {
      title: 'Main Academic Block',
      description: 'Front view of the main academic building on a sunny day.',
      imageUrl:
        'https://imgs.search.brave.com/djoUs7f6IrW3w1yQZwum1eXxOOyRMrgwDg-kahmlSkI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hcmNo/ZWxsby5jb20vdGh1/bWJzL2ltYWdlcy8y/MDIzLzEyLzI5L2Nj/YmEtZGVzaWducy1j/ZXB0LXVuaXZlcnNp/dHktLS1uZXctYWNh/ZGVtaWMtYmxvY2st/YXVkaXRvcml1bXMt/YXJjaGVsbG8uMTcw/Mzg1MzkwMy44MjE4/LmpwZz9maXQ9Y3Jv/cCZhdXRvPWNvbXBy/ZXNz',
      thumbnailUrl:
        'https://imgs.search.brave.com/djoUs7f6IrW3w1yQZwum1eXxOOyRMrgwDg-kahmlSkI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hcmNo/ZWxsby5jb20vdGh1/bWJzL2ltYWdlcy8y/MDIzLzEyLzI5L2Nj/YmEtZGVzaWducy1j/ZXB0LXVuaXZlcnNp/dHktLS1uZXctYWNh/ZGVtaWMtYmxvY2st/YXVkaXRvcml1bXMt/YXJjaGVsbG8uMTcw/Mzg1MzkwMy44MjE4/LmpwZz9maXQ9Y3Jv/cCZhdXRvPWNvbXBy/ZXNz',
      imageFileId: 'seed-campus-2',
      uploader: admin._id,
      uploaderName: admin.name,
      uploaderRole: admin.role,
      event: null,
      tags: ['campus', 'building', 'college'],
    }
  );

  return docs;
}

// ---------------------------------------------------------------------------
// MAIN SEED FUNCTION
// ---------------------------------------------------------------------------
async function seedDatabase() {
  try {
    // Connect to MongoDB (same URI you already used)
    await mongoose.connect(
      'mongodb://amankumarofficial935_db_user:cms2026@ac-icywfbr-shard-00-00.ppypk8e.mongodb.net:27017,ac-icywfbr-shard-00-01.ppypk8e.mongodb.net:27017,ac-icywfbr-shard-00-02.ppypk8e.mongodb.net:27017/?ssl=true&replicaSet=atlas-13987v-shard-0&authSource=admin&appName=EMS-Cluster0'
    );
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await Notice.deleteMany({});
    await Gallery.deleteMany({});
    console.log('🗑️ Cleared existing Users, Events, Registrations, Notices & Gallery');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`   ✓ Created ${userData.role}: ${userData.email}`);
    }

    const admin = createdUsers.find((u) => u.role === 'admin');
    const organizer = createdUsers.find((u) => u.role === 'organizer');
    const students = createdUsers.filter((u) => u.role === 'student');

    // Create events
    console.log('📅 Creating events...');
    const createdEvents = [];
    for (const eventData of seedEvents) {
      const event = new Event({
        ...eventData,
        organizer: organizer._id,
        organizerName: organizer.name,
      });
      await event.save();
      createdEvents.push(event);
      console.log(`   ✓ Created event: ${eventData.title}`);
    }

    // Create notices
    console.log('🔔 Creating notices...');
    for (const noticeData of seedNotices) {
      const createdBy =
        noticeData.category === 'event' && organizer ? organizer : admin;
      const notice = new Notice({
        ...noticeData,
        createdBy: createdBy._id,
      });
      await notice.save();
      console.log(`   ✓ Created notice: ${notice.title}`);
    }

    // Create gallery images
    console.log('🖼️ Creating gallery images...');
    const galleryDocs = buildSeedGallery(organizer, admin, createdEvents);
    if (galleryDocs.length > 0) {
      await Gallery.insertMany(galleryDocs);
      console.log(`   ✓ Inserted ${galleryDocs.length} gallery images`);
    } else {
      console.log('   ⚠️ No gallery images created (no matching events found)');
    }

    // Sample registrations
    console.log('📝 Creating sample registrations...');
    const approvedEvents = createdEvents.filter((e) => e.status === 'approved');

    const techFest = approvedEvents.find((e) =>
      e.title.toLowerCase().includes('tech fest')
    );
    const culturalNight = approvedEvents.find((e) =>
      e.title.toLowerCase().includes('cultural')
    );

    // Register Alice for Tech Fest
    if (techFest && students[0]) {
      const registration = new Registration({
        event: techFest._id,
        user: students[0]._id,
        status: 'registered',
        additionalInfo: {
          dietaryRestrictions: 'Vegetarian',
          emergencyContact: {
            name: 'Alice Parent',
            phone: '+9876543210',
          },
        },
      });
      await registration.save();
      console.log('   ✓ Registered Alice for Tech Fest');
    }

    // Register Bob for Cultural Night
    if (culturalNight && students[1]) {
      const registration = new Registration({
        event: culturalNight._id,
        user: students[1]._id,
        status: 'registered',
      });
      await registration.save();
      console.log('   ✓ Registered Bob for Cultural Night');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials (seed):');
    console.log('Admin:    admin@college.edu        / Admin123');
    console.log('Organizer: john.organizer@college.edu / Org123');
    console.log('Student:  alice.student@college.edu / Student123');
    console.log('Student:  bob.student@college.edu   / Student123');
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