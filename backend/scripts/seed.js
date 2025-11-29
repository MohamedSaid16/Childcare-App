const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Child = require('../models/Child');
const Classroom = require('../models/Classroom');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@nursery.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1234567890'
  },
  {
    firstName: 'John',
    lastName: 'Parent',
    email: 'parent@example.com',
    password: 'parent123',
    role: 'parent',
    phone: '+1234567891',
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701'
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Teacher',
    email: 'teacher@nursery.com',
    password: 'teacher123',
    role: 'employee',
    phone: '+1234567892'
  }
];

const seedClassrooms = [
  {
    name: 'Toddlers A',
    capacity: 12,
    ageGroup: {
      minAge: 12, // months
      maxAge: 24  // months
    },
    schedule: {
      startTime: '08:00',
      endTime: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    facilities: ['toys', 'nap area', 'playground']
  }
];

const seedDB = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Classroom.deleteMany({});
    await Child.deleteMany({});

    console.log('Existing data cleared');

    // Create users
    const createdUsers = await User.insertMany(seedUsers);
    console.log('Users created');

    // Create classrooms
    const classroomData = seedClassrooms.map(classroom => ({
      ...classroom,
      assignedTeacher: createdUsers.find(u => u.role === 'employee')._id
    }));

    const createdClassrooms = await Classroom.insertMany(classroomData);
    console.log('Classrooms created');

    // Create sample child
    const parent = createdUsers.find(u => u.role === 'parent');
    const toddlerClassroom = createdClassrooms[0];

    const child = await Child.create({
      firstName: 'Emma',
      lastName: 'Parent',
      dateOfBirth: new Date('2022-05-15'),
      gender: 'female',
      parent: parent._id,
      classroom: toddlerClassroom._id,
      medicalInfo: {
        allergies: ['peanuts'],
        medications: [],
        specialNeeds: 'None'
      },
      emergencyContacts: [
        {
          name: 'John Parent',
          phone: '+1234567891',
          relationship: 'Father'
        }
      ]
    });

    // Update classroom with child
    toddlerClassroom.children.push(child._id);
    await toddlerClassroom.updateCurrentCount();

    console.log('Sample child created');
    console.log('Database seeded successfully!');

    // Display login credentials
    console.log('\n=== Login Credentials ===');
    console.log('Admin: admin@nursery.com / admin123');
    console.log('Parent: parent@example.com / parent123');
    console.log('Employee: teacher@nursery.com / teacher123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();