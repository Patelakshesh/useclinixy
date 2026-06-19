import Doctor from '../models/doctor.model';
import Patient from '../models/patient.model';
import Appointment from '../models/appointment.model';
import { Types } from 'mongoose';

export const getDashboardStats = async (clinicId: string) => {
  const cId = new Types.ObjectId(clinicId);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [totalDoctors, totalPatients, todaysAppointments, upcomingAppointments] = await Promise.all([
    Doctor.countDocuments({ clinicId: cId, status: 'ACTIVE' }),
    Patient.countDocuments({ clinicId: cId }),
    Appointment.countDocuments({ clinicId: cId, appointmentDate: todayStr, status: { $ne: 'CANCELLED' } }),
    Appointment.countDocuments({ clinicId: cId, appointmentDate: { $gt: todayStr }, status: { $ne: 'CANCELLED' } })
  ]);

  // Generate chart data for the last 7 days based on appointments
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = await Appointment.countDocuments({ clinicId: cId, appointmentDate: dateStr });
    chartData.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      appointments: count
    });
  }

  return {
    totalDoctors,
    totalPatients,
    todaysAppointments,
    upcomingAppointments,
    chartData
  };
};

export const getRecentActivities = async (clinicId: string) => {
  const cId = new Types.ObjectId(clinicId);
  const recentAppointments = await Appointment.find({ clinicId: cId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('patientId', 'name')
    .populate('doctorId', 'name');

  const recentPatients = await Patient.find({ clinicId: cId })
    .sort({ createdAt: -1 })
    .limit(5);

  const activities = [
    ...recentAppointments.map(app => ({
      id: app._id.toString(),
      type: 'APPOINTMENT',
      description: `New appointment booked for ${(app.patientId as any)?.name} with Dr. ${(app.doctorId as any)?.name}`,
      time: app.createdAt
    })),
    ...recentPatients.map(pat => ({
      id: pat._id.toString(),
      type: 'PATIENT',
      description: `New patient registered: ${pat.name}`,
      time: pat.createdAt
    }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);

  return activities;
};
