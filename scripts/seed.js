const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || 'exam-portal-e252b'
});

const db = admin.firestore();

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const adminUser = await admin.auth().createUser({
      email: 'admin@mcq-competition.com',
      password: 'Admin123!',
      displayName: 'Administrator'
    });

    await db.collection('users').doc(adminUser.uid).set({
      uid: adminUser.uid,
      username: 'admin',
      role: 'admin',
      email: 'admin@mcq-competition.com',
      password: 'admin', // Simple password for testing
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });

    console.log('✅ Admin user created:', adminUser.uid);

    // Create sample students
    const students = [
      { username: 'student1', email: 'student1@example.com', password: 'Student123!' },
      { username: 'student2', email: 'student2@example.com', password: 'Student123!' },
      { username: 'student3', email: 'student3@example.com', password: 'Student123!' },
      { username: 'student4', email: 'student4@example.com', password: 'Student123!' },
      { username: 'student5', email: 'student5@example.com', password: 'Student123!' }
    ];

    const studentUids = [];

    for (const student of students) {
      const userRecord = await admin.auth().createUser({
        email: student.email,
        password: student.password,
        displayName: student.username
      });

      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        username: student.username,
        role: 'student',
        email: student.email,
        password: 'student', // Simple password for testing
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true
      });

      studentUids.push(userRecord.uid);
      console.log(`✅ Student created: ${student.username} (${userRecord.uid})`);
    }

    // Create sample contest
    const contestRef = db.collection('contests').doc();
    const contestId = contestRef.id;

    const contest = {
      id: contestId,
      title: 'Sample Math Quiz',
      description: 'A sample mathematics quiz for testing purposes',
      duration: 3600, // 1 hour
      status: 'draft',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: adminUser.uid,
      totalQuestions: 5,
      maxScore: 50
    };

    await contestRef.set(contest);

    // Create sample questions
    const questions = [
      {
        text: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        points: 10
      },
      {
        text: 'What is the square root of 16?',
        options: ['2', '4', '8', '16'],
        correctAnswer: 1,
        points: 10
      },
      {
        text: 'What is 5 × 3?',
        options: ['12', '15', '18', '20'],
        correctAnswer: 1,
        points: 10
      },
      {
        text: 'What is 20 ÷ 4?',
        options: ['4', '5', '6', '8'],
        correctAnswer: 1,
        points: 10
      },
      {
        text: 'What is the value of π (pi) to 2 decimal places?',
        options: ['3.14', '3.15', '3.16', '3.17'],
        correctAnswer: 0,
        points: 10
      }
    ];

    const batch = db.batch();
    questions.forEach((question, index) => {
      const questionRef = db.collection('contests').doc(contestId).collection('questions').doc();
      batch.set(questionRef, {
        ...question,
        id: questionRef.id,
        contestId,
        order: index + 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();

    console.log('✅ Sample contest created:', contestId);
    console.log('✅ Sample questions created:', questions.length);

    // Create sample sessions for students
    for (const studentUid of studentUids) {
      const sessionId = uuidv4();
      await db.collection('sessions').doc(sessionId).set({
        sessionId,
        userId: studentUid,
        role: 'student',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        isActive: false // Inactive by default
      });
    }

    console.log('✅ Sample sessions created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Admin user: admin@mcq-competition.com (password: Admin123!)`);
    console.log(`- Students: student1 to student5 (password: Student123!)`);
    console.log(`- Sample contest: ${contestId}`);
    console.log(`- Total questions: ${questions.length}`);
    console.log('\n🔐 Login credentials:');
    console.log('Admin: admin / Admin123!');
    console.log('Students: student1-student5 / Student123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase().then(() => {
  console.log('✅ Seeding process completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seeding process failed:', error);
  process.exit(1);
});
