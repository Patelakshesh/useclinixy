'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, CheckCircle2, ChevronRight, Loader2, Hospital } from 'lucide-react';
import { format, addDays } from 'date-fns';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
});

export default function PublicBookingPage() {
  const router = useRouter();
  
  const [clinicId, setClinicId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clinic, setClinic] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);

  // Booking State
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [patientDetails, setPatientDetails] = useState({ name: '', phone: '', email: '', age: '', gender: 'MALE' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Extract subdomain (e.g. "demo.useclinixy.online" -> "demo")
      const parts = hostname.split('.');
      let extractedId = '';
      if (parts.length > 2) {
        extractedId = parts[0];
      } else if (parts.length === 2 && hostname.includes('localhost')) {
        extractedId = parts[0];
      }
      
      if (extractedId && extractedId !== 'www' && extractedId !== 'useclinixy') {
        setClinicId(extractedId);
      } else {
        setError('Invalid booking link. Subdomain missing.');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const [clinicRes, doctorsRes] = await Promise.all([
          api.get(`/public/${clinicId}`),
          api.get(`/public/${clinicId}/doctors`)
        ]);
        setClinic(clinicRes.data.data);
        const fetchedDoctors = doctorsRes.data.data;
        setDoctors(fetchedDoctors);

        // Smart UX: Auto-skip Step 1 if there is only 1 doctor
        if (fetchedDoctors.length === 1) {
          setSelectedDoctor(fetchedDoctors[0]);
          setStep(2);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Clinic not found or online booking is disabled.');
      } finally {
        setLoading(false);
      }
    };
    if (clinicId) fetchClinicData();
  }, [clinicId]);

  // Fetch booked slots when doctor or date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDoctor || !selectedDate || !clinicId) return;
      try {
        const res = await api.get(`/public/${clinicId}/booked-slots`, {
          params: {
            doctorId: selectedDoctor._id,
            date: format(selectedDate, 'yyyy-MM-dd')
          }
        });
        setBookedSlots(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch booked slots', error);
      }
    };
    fetchBookedSlots();
  }, [selectedDoctor, selectedDate, clinicId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-black p-4 text-center">
        <Hospital className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Booking Unavailable</h1>
        <p className="text-slate-500 max-w-md">{error}</p>
      </div>
    );
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedTime || !patientDetails.name || !patientDetails.phone) return;
    
    setIsSubmitting(true);
    try {
      const res = await api.post(`/public/${clinicId}/book`, {
        doctorId: selectedDoctor._id,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        appointmentTime: selectedTime,
        patientName: patientDetails.name,
        patientMobile: patientDetails.phone,
        patientEmail: patientDetails.email,
        age: Number(patientDetails.age) || 25,
        gender: patientDetails.gender
      });
      setSuccessData(res.data.data);
      setStep(4);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate 7 days for date picker
  const upcomingDates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  // Generate timeslots for selected doctor
  const getAvailableSlots = () => {
    if (!selectedDoctor) return [];
    const dayName = format(selectedDate, 'EEEE'); // e.g., 'Monday'
    const daySchedule = selectedDoctor.schedule?.find((s: any) => s.day === dayName);
    
    if (!daySchedule || !daySchedule.isWorkingDay) return [];

    const slots: string[] = [];
    const now = new Date();
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    daySchedule.shifts.forEach((shift: any) => {
      // Very basic 15-min interval generator for the shift
      let current = new Date(`2000-01-01T${shift.startTime}`);
      const end = new Date(`2000-01-01T${shift.endTime}`);
      while (current < end) {
        const timeString = format(current, 'HH:mm');
        
        // Filter out past times if it's today
        const slotMinutes = current.getHours() * 60 + current.getMinutes();
        const isPast = isToday && slotMinutes <= currentMinutes;
        
        // Filter out already booked slots
        const isBooked = bookedSlots.includes(timeString);

        if (!isPast && !isBooked) {
          slots.push(timeString);
        }
        
        current.setMinutes(current.getMinutes() + 15);
      }
    });
    return slots;
  };

  const availableSlots = getAvailableSlots();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-[#111] border-b border-slate-200 dark:border-neutral-800 py-4 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-3">
          {clinic.logo ? (
            <img src={clinic.logo} alt={clinic.name} className="w-10 h-10 rounded-xl object-cover shadow-md border border-slate-200 dark:border-neutral-800 bg-white" />
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
              {clinic.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{clinic.name}</h1>
            <p className="text-xs text-slate-500">{clinic.address}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Progress Bar */}
        {step < 4 && (
          <div className="mb-10 relative px-4">
            {/* Background Line */}
            <div className="absolute top-4 left-12 right-12 h-1 bg-slate-200 dark:bg-neutral-800 rounded-full z-0 overflow-hidden">
               {/* Filled Progress Line */}
               <div className="h-full bg-blue-600 transition-all duration-500 ease-in-out" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            </div>

            {/* Circles and Text */}
            <div className="flex justify-between relative z-10">
              {[
                { stepNum: 1, label: 'Select Doctor' },
                { stepNum: 2, label: 'Pick Time' },
                { stepNum: 3, label: 'Details' }
              ].map((s) => (
                <div key={s.stepNum} className="flex flex-col items-center gap-2 w-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s.stepNum ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 ring-4 ring-slate-50 dark:ring-[#050505]' : 'bg-slate-200 text-slate-500 dark:bg-neutral-800 dark:text-neutral-500 ring-4 ring-slate-50 dark:ring-[#050505]'}`}>
                    {s.stepNum}
                  </div>
                  <span className={`text-xs font-semibold ${step >= s.stepNum ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-neutral-800 overflow-hidden">
          
          {step === 1 && (
            <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Choose a Doctor</h2>
              {doctors.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No doctors available for online booking at this time.</p>
              ) : (
                <div className="grid gap-4">
                  {doctors.map(doctor => (
                    <button 
                      key={doctor._id}
                      onClick={() => { setSelectedDoctor(doctor); setStep(2); }}
                      className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-lg font-bold text-slate-700 dark:text-slate-300">
                          {doctor.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Dr. {doctor.name}</h3>
                          <p className="text-sm text-slate-500">{doctor.specialization}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-neutral-800">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-lg font-bold">
                  {selectedDoctor.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Selected Doctor</p>
                  <h3 className="font-bold text-slate-900 dark:text-white">Dr. {selectedDoctor.name}</h3>
                </div>
                <button onClick={() => setStep(1)} className="ml-auto text-sm text-blue-600 hover:underline font-medium">Change</button>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-500" /> Select Date
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {upcomingDates.map((date, i) => {
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                      className={`flex flex-col items-center justify-center min-w-[70px] h-20 rounded-xl border-2 transition-all snap-start shrink-0 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-slate-100 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>{format(date, 'EEE')}</span>
                      <span className={`text-xl font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>{format(date, 'd')}</span>
                    </button>
                  );
                })}
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" /> Select Time
              </h3>
              {availableSlots.length === 0 ? (
                <p className="text-slate-500 p-4 bg-slate-50 dark:bg-neutral-900 rounded-xl text-center text-sm border border-slate-100 dark:border-neutral-800">
                  Doctor is not available on {format(selectedDate, 'EEEE')}. Please select another date.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                        selectedTime === time
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-100 dark:border-neutral-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                {doctors.length > 1 && (
                  <button 
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button 
                  disabled={!selectedTime}
                  onClick={() => setStep(3)}
                  className={`${doctors.length > 1 ? 'w-2/3' : 'w-full'} py-3 bg-slate-900 text-white dark:bg-white dark:text-black font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors`}
                >
                  Continue to Details
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-neutral-800">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Appointment</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {format(selectedDate, 'MMM d, yyyy')} at {selectedTime}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">with Dr. {selectedDoctor.name}</p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Patient Details</h2>
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={patientDetails.name}
                      onChange={e => setPatientDetails({...patientDetails, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="tel" 
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      title="Mobile number must be exactly 10 digits"
                      value={patientDetails.phone}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPatientDetails({...patientDetails, phone: val});
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all dark:text-white"
                      placeholder="9876543210"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-1">We'll send your booking confirmation here.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={patientDetails.email}
                      onChange={e => setPatientDetails({...patientDetails, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
                    <input 
                      type="number" 
                      value={patientDetails.age}
                      onChange={e => setPatientDetails({...patientDetails, age: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all dark:text-white"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                    <select
                      value={patientDetails.gender}
                      onChange={e => setPatientDetails({...patientDetails, gender: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all dark:text-white cursor-pointer"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 py-3 bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 4 && successData && (
            <div className="p-8 sm:p-12 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Booking Confirmed!</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                Your appointment with Dr. {selectedDoctor?.name} has been successfully scheduled.
              </p>
              
              <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 text-left max-w-sm mx-auto shadow-inner">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Date & Time</p>
                    <p className="font-bold text-slate-900 dark:text-white">{format(new Date(successData.appointmentDate), 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-slate-700 dark:text-slate-300">{successData.appointmentTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Patient</p>
                    <p className="font-bold text-slate-900 dark:text-white">{patientDetails.name}</p>
                    <p className="text-slate-700 dark:text-slate-300">{patientDetails.phone}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setStep(1); setSelectedDoctor(null); setSelectedTime(''); setPatientDetails({name:'', phone:'', age:'', gender:'MALE'}); }}
                className="mt-8 text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium hover:underline"
              >
                Book Another Appointment
              </button>
            </div>
          )}

        </div>

        {/* Viral Marketing Badge */}
        <div className="mt-8 text-center animate-in fade-in duration-700 delay-300">
          <a href="https://useclinixy.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 dark:text-neutral-600 dark:hover:text-neutral-400 transition-colors">
            Powered by <span className="text-slate-900 dark:text-white font-bold">Clinixy</span>
          </a>
        </div>
      </main>
    </div>
  );
}
