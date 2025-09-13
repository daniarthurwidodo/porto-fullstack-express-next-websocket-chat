import mongoose from 'mongoose';
import User from './models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/chatapp?authSource=admin';

const seedUsers = [
  {
    username: 'alice_demo',
    email: 'alice@demo.com',
    password: 'demo123'
  },
  {
    username: 'bob_demo',
    email: 'bob@demo.com',
    password: 'demo123'
  },
  {
    username: 'charlie',
    email: 'charlie@example.com',
    password: 'password123'
  },
  {
    username: 'diana',
    email: 'diana@example.com',
    password: 'password123'
  },
  {
    username: 'edward',
    email: 'edward@example.com',
    password: 'password123'
  },
  {
    username: 'fiona',
    email: 'fiona@example.com',
    password: 'password123'
  },
  {
    username: 'george',
    email: 'george@example.com',
    password: 'password123'
  },
  {
    username: 'helen',
    email: 'helen@example.com',
    password: 'password123'
  },
  {
    username: 'ivan',
    email: 'ivan@example.com',
    password: 'password123'
  },
  {
    username: 'julia',
    email: 'julia@example.com',
    password: 'password123'
  },
  {
    username: 'kevin',
    email: 'kevin@example.com',
    password: 'password123'
  },
  {
    username: 'lisa',
    email: 'lisa@example.com',
    password: 'password123'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create new users
    for (const userData of seedUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.username}`);
    }

    console.log('Database seeded successfully!');
    console.log('\nDemo credentials:');
    console.log('User 1: alice@demo.com / demo123');
    console.log('User 2: bob@demo.com / demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
