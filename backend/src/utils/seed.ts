import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Clinic from '../models/clinic.model';
import User from '../models/user.model';
import Doctor from '../models/doctor.model';
import Patient from '../models/patient.model';
import Appointment from '../models/appointment.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-saas';

const indianDoctors = [
  { name: 'Dr. Ramesh Sharma', spec: 'Cardiologist', fees: 1500, exp: 12 },
  { name: 'Dr. Priya Patel', spec: 'Dermatologist', fees: 800, exp: 8 },
  { name: 'Dr. Sanjay Gupta', spec: 'Orthopedic', fees: 1200, exp: 15 },
  { name: 'Dr. Anjali Desai', spec: 'Pediatrician', fees: 900, exp: 10 },
  { name: 'Dr. Vikram Singh', spec: 'Neurologist', fees: 2000, exp: 18 },
  { name: 'Dr. Neha Verma', spec: 'Gynecologist', fees: 1000, exp: 11 },
  { name: 'Dr. Rajesh Kumar', spec: 'General Physician', fees: 500, exp: 20 },
  { name: 'Dr. Sunita Reddy', spec: 'Ophthalmologist', fees: 1100, exp: 14 },
  { name: 'Dr. Amit Joshi', spec: 'Psychiatrist', fees: 1500, exp: 9 },
  { name: 'Dr. Kavita Iyer', spec: 'ENT Specialist', fees: 800, exp: 7 },
  { name: 'Dr. Anil Kapoor', spec: 'Pulmonologist', fees: 1300, exp: 16 },
  { name: 'Dr. Meera Nair', spec: 'Endocrinologist', fees: 1400, exp: 13 },
  { name: 'Dr. Prakash Rao', spec: 'Urologist', fees: 1600, exp: 17 },
  { name: 'Dr. Shalini Menon', spec: 'Gastroenterologist', fees: 1200, exp: 12 },
  { name: 'Dr. Karthik Raj', spec: 'Dentist', fees: 600, exp: 5 },
];

const indianPatients = [
  { name: 'Aarav Sharma', age: 34, gender: 'MALE', phone: '9876543210' },
  { name: 'Vivaan Patel', age: 45, gender: 'MALE', phone: '9876543211' },
  { name: 'Aditya Gupta', age: 28, gender: 'MALE', phone: '9876543212' },
  { name: 'Vihaan Singh', age: 12, gender: 'MALE', phone: '9876543213' },
  { name: 'Arjun Verma', age: 55, gender: 'MALE', phone: '9876543214' },
  { name: 'Sai Kumar', age: 62, gender: 'MALE', phone: '9876543215' },
  { name: 'Ayaan Reddy', age: 31, gender: 'MALE', phone: '9876543216' },
  { name: 'Krishna Joshi', age: 40, gender: 'MALE', phone: '9876543217' },
  { name: 'Ishaan Iyer', age: 25, gender: 'MALE', phone: '9876543218' },
  { name: 'Shaurya Kapoor', age: 8, gender: 'MALE', phone: '9876543219' },
  { name: 'Diya Nair', age: 29, gender: 'FEMALE', phone: '9876543220' },
  { name: 'Ananya Rao', age: 37, gender: 'FEMALE', phone: '9876543221' },
  { name: 'Aadhya Menon', age: 50, gender: 'FEMALE', phone: '9876543222' },
  { name: 'Kiara Raj', age: 19, gender: 'FEMALE', phone: '9876543223' },
  { name: 'Saanvi Desai', age: 42, gender: 'FEMALE', phone: '9876543224' },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    await Clinic.deleteMany({});
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    
    // 1. Create a Default Clinic
    const clinic = await Clinic.create({
      name: 'Apollo Spectra Clinic',
      address: '45 MG Road, Bangalore, India',
      email: 'contact@apolloclinic.in',
      mobileNumber: '+919876543210',
      workingHours: { start: '09:00', end: '20:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
      status: 'ACTIVE',
    });

    // 2. Create Super Admin User
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      clinicId: clinic._id,
      name: 'Clinic Admin',
      email: 'admin@clinic.com',
      password: hashedPassword,
      role: 'CLINIC_ADMIN',
      status: 'ACTIVE',
    });

    // 3. Create 15 Doctors
    const doctors = await Promise.all(
      indianDoctors.map((doc, i) => Doctor.create({
        clinicId: clinic._id,
        name: doc.name,
        email: `doctor${i+1}@clinic.com`,
        mobileNumber: `+9190000000${i.toString().padStart(2, '0')}`,
        specialization: doc.spec,
        qualification: 'MBBS, MD',
        experience: doc.exp,
        consultationFees: doc.fees,
        status: 'ACTIVE',
      }))
    );

    // 4. Create 15 Patients
    const patients = await Promise.all(
      indianPatients.map(p => Patient.create({
        clinicId: clinic._id,
        name: p.name,
        mobileNumber: `+91${p.phone}`,
        age: p.age,
        gender: p.gender,
        address: 'Bangalore, Karnataka',
      }))
    );

    // 5. Create 15 Appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const appointments = [];
    for (let i = 0; i < 15; i++) {
      appointments.push({
        clinicId: clinic._id,
        doctorId: doctors[i]._id,
        patientId: patients[i]._id,
        appointmentDate: i % 2 === 0 ? todayStr : tomorrowStr,
        appointmentTime: `${10 + (i % 8)}:00`,
        status: i % 3 === 0 ? 'CONFIRMED' : (i % 4 === 0 ? 'COMPLETED' : 'PENDING'),
        notes: 'General checkup',
      });
    }
    await Appointment.insertMany(appointments);

    console.log('✨ Seeded 15 Indian Doctors, 15 Patients, and 15 Appointments successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
