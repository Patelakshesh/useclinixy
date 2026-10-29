import Doctor from '../models/doctor.model';
import Patient from '../models/patient.model';
import Appointment from '../models/appointment.model';
import User from '../models/user.model';
import AuditLog from '../models/auditLog.model';
import { Types } from 'mongoose';

export const getDashboardStats = async (clinicId: string, user: any) => {
  const cId = new Types.ObjectId(clinicId);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const appointmentFilter: any = { clinicId: cId, status: { $ne: 'CANCELLED' } };
  const patientFilter: any = { clinicId: cId };

  if (user.role === 'DOCTOR' && user.doctorId) {
    appointmentFilter.doctorId = new Types.ObjectId(user.doctorId);
  }

  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const next7Days = new Date(today);
  next7Days.setDate(next7Days.getDate() + 7);
  const next7DaysStr = next7Days.toISOString().split('T')[0];

  const [
    totalDoctors, 
    totalPatients, 
    todaysAppointments, 
    upcomingAppointments,
    newDoctorsThisMonth,
    patientsThisMonth,
    patientsLastMonth,
    yesterdaysAppointments,
    next7DaysAppts
  ] = await Promise.all([
    Doctor.countDocuments({ clinicId: cId, status: 'ACTIVE' }),
    Patient.countDocuments(patientFilter),
    Appointment.countDocuments({ ...appointmentFilter, appointmentDate: todayStr }),
    Appointment.countDocuments({ ...appointmentFilter, appointmentDate: { $gt: todayStr } }),
    Doctor.countDocuments({ clinicId: cId, status: 'ACTIVE', createdAt: { $gte: startOfCurrentMonth } }),
    Patient.countDocuments({ ...patientFilter, createdAt: { $gte: startOfCurrentMonth } }),
    Patient.countDocuments({ ...patientFilter, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    Appointment.countDocuments({ ...appointmentFilter, appointmentDate: yesterdayStr }),
    Appointment.countDocuments({ ...appointmentFilter, appointmentDate: { $gt: todayStr, $lte: next7DaysStr } })
  ]);

  // Patients month-over-month growth
  let patientTrendLabel = '0 new this month';
  let patientTrendPositive: boolean | null = null;
  if (patientsLastMonth > 0) {
    const diff = patientsThisMonth - patientsLastMonth;
    const pct = Math.round((diff / patientsLastMonth) * 100);
    patientTrendLabel = `${pct >= 0 ? '+' : ''}${pct}% vs last month`;
    patientTrendPositive = pct >= 0;
  } else if (patientsThisMonth > 0) {
    patientTrendLabel = `+${patientsThisMonth} new this month`;
    patientTrendPositive = true;
  }

  // Doctors trend
  let doctorTrendLabel = 'No doctors registered';
  let doctorTrendPositive: boolean | null = null;
  if (newDoctorsThisMonth > 0) {
    doctorTrendLabel = `+${newDoctorsThisMonth} joined this month`;
    doctorTrendPositive = true;
  } else if (totalDoctors > 0) {
    doctorTrendLabel = `${totalDoctors} active doctor${totalDoctors > 1 ? 's' : ''}`;
    doctorTrendPositive = true;
  }

  // Today's appointments trend
  let todaysApptTrendLabel = 'No visits scheduled today';
  let todaysApptTrendPositive: boolean | null = null;
  if (todaysAppointments > 0) {
    if (yesterdaysAppointments > 0) {
      const diff = todaysAppointments - yesterdaysAppointments;
      todaysApptTrendLabel = `${diff >= 0 ? '+' : ''}${diff} vs yesterday`;
      todaysApptTrendPositive = diff >= 0;
    } else {
      todaysApptTrendLabel = `${todaysAppointments} scheduled today`;
      todaysApptTrendPositive = true;
    }
  }

  // Upcoming appointments trend
  let upcomingTrendLabel = 'No upcoming visits';
  let upcomingTrendPositive: boolean | null = null;
  if (upcomingAppointments > 0) {
    if (next7DaysAppts > 0) {
      upcomingTrendLabel = `${next7DaysAppts} in next 7 days`;
      upcomingTrendPositive = true;
    } else {
      upcomingTrendLabel = `${upcomingAppointments} scheduled ahead`;
      upcomingTrendPositive = true;
    }
  }

  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = await Appointment.countDocuments({ 
      clinicId: cId, 
      appointmentDate: dateStr,
      ...(user.role === 'DOCTOR' && user.doctorId ? { doctorId: new Types.ObjectId(user.doctorId) } : {})
    });
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
    trends: {
      doctors: doctorTrendLabel,
      patients: patientTrendLabel,
      todaysAppointments: todaysApptTrendLabel,
      upcoming: upcomingTrendLabel,
      doctorsPositive: doctorTrendPositive,
      patientsPositive: patientTrendPositive,
      todaysPositive: todaysApptTrendPositive,
      upcomingPositive: upcomingTrendPositive
    },
    chartData
  };
};

export const getRecentActivities = async (clinicId: string, user: any) => {
  const cId = new Types.ObjectId(clinicId);
  
  const appointmentFilter: any = { clinicId: cId };
  const patientFilter: any = { clinicId: cId };

  if (user.role === 'DOCTOR' && user.doctorId) {
    appointmentFilter.doctorId = new Types.ObjectId(user.doctorId);
  } else if (user.role === 'RECEPTIONIST') {
    // Receptionists only see their own activity
    const myLogs = await AuditLog.find({ clinicId: cId, userId: new Types.ObjectId(user.userId) }).select('action details');
    const myApptIds = myLogs.filter(l => l.action.startsWith('APPOINTMENT')).map(l => l.details?.appointmentId).filter(Boolean);
    const myPatIds = myLogs.filter(l => l.action.startsWith('PATIENT')).map(l => l.details?.patientId).filter(Boolean);
    
    appointmentFilter._id = { $in: myApptIds.length ? myApptIds : [new Types.ObjectId()] }; // Prevent empty $in pulling all
    patientFilter._id = { $in: myPatIds.length ? myPatIds : [new Types.ObjectId()] };
  }

  const recentAppointments = await Appointment.find(appointmentFilter)
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate('patientId', 'name')
    .populate('doctorId', 'name');

  const recentPatients = await Patient.find(patientFilter)
    .sort({ updatedAt: -1 })
    .limit(5);

  let activities = [
    ...recentAppointments.map(app => {
      const isNew = Math.abs((app as any).createdAt.getTime() - (app as any).updatedAt.getTime()) < 1000;
      let desc = isNew 
        ? `New appointment booked for ${(app.patientId as any)?.name || 'Unknown'} with Dr. ${(app.doctorId as any)?.name || 'Unknown'}`
        : `Appointment updated for ${(app.patientId as any)?.name || 'Unknown'} with Dr. ${(app.doctorId as any)?.name || 'Unknown'}`;
        
      if (app.status === 'CANCELLED') desc = `Appointment CANCELLED for ${(app.patientId as any)?.name || 'Unknown'} (Dr. ${(app.doctorId as any)?.name || 'Unknown'})`;
      else if (app.status === 'COMPLETED') desc = `Appointment COMPLETED for ${(app.patientId as any)?.name || 'Unknown'} (Dr. ${(app.doctorId as any)?.name || 'Unknown'})`;
      else if (app.status === 'CONFIRMED') desc = `Appointment CONFIRMED for ${(app.patientId as any)?.name || 'Unknown'}`;

      return {
        id: app._id.toString() + '-app-' + (app as any).updatedAt.getTime(),
        type: 'APPOINTMENT',
        description: desc,
        time: (app as any).updatedAt
      };
    }),
  ];

  // Doctors might only care about appointments, but we'll include patients if they want
  if (user.role !== 'DOCTOR') {
    activities.push(
      ...recentPatients.map(pat => {
        const isNew = Math.abs((pat as any).createdAt.getTime() - (pat as any).updatedAt.getTime()) < 1000;
        return {
          id: pat._id.toString() + '-pat-' + (pat as any).updatedAt.getTime(),
          type: 'PATIENT',
          description: isNew ? `New patient registered: ${pat.name}` : `Patient record updated: ${pat.name}`,
          time: (pat as any).updatedAt
        };
      })
    );

    // Also include recently added staff for clinic admins
    if (user.role === 'CLINIC_ADMIN') {
      const recentStaff = await User.find({ clinicId: cId, role: { $in: ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST'] } })
        .sort({ updatedAt: -1 })
        .limit(5);

      activities.push(
        ...recentStaff.map(staff => {
          const isNew = Math.abs((staff as any).createdAt.getTime() - (staff as any).updatedAt.getTime()) < 1000;
          return {
            id: staff._id.toString() + '-staff-' + (staff as any).updatedAt.getTime(),
            type: 'STAFF',
            description: isNew ? `New staff account created: ${staff.name} (${staff.role.replace('_', ' ')})` : `Staff account updated: ${staff.name} (${staff.role.replace('_', ' ')})`,
            time: (staff as any).updatedAt
          };
        })
      );
    }
  }

  return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);
};
