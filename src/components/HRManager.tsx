import React, { useState, useMemo } from 'react';
import { Users, Clock, CreditCard, Plus, Check, X, Phone, DollarSign, Calendar, Edit, Trash2 } from 'lucide-react';
import { Worker, AttendanceRecord, SalaryPayment, ExpenseEntry, UserRole } from '../types';
import { toBengaliNumber, formatCurrency } from '../utils';

interface HRManagerProps {
  workers: Worker[];
  attendance: AttendanceRecord[];
  salaries: SalaryPayment[];
  onAddWorker: (worker: Omit<Worker, 'id'>) => void;
  onUpdateWorker: (id: string, worker: Omit<Worker, 'id'>) => void;
  onDeleteWorker: (id: string) => void;
  onLogAttendance: (record: AttendanceRecord) => void;
  onDeleteAttendance?: (recordId: string) => void;
  onPaySalary: (payment: Omit<SalaryPayment, 'id'>) => void;
  onUpdateSalary?: (id: string, payment: Omit<SalaryPayment, 'id'>) => void;
  onDeleteSalary?: (id: string) => void;
  userRole: UserRole;
}

export default function HRManager({
  workers,
  attendance,
  salaries,
  onAddWorker,
  onUpdateWorker,
  onDeleteWorker,
  onLogAttendance,
  onDeleteAttendance,
  onPaySalary,
  onUpdateSalary,
  onDeleteSalary,
  userRole
}: HRManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'payroll'>('attendance');
  
  // Date state for attendance
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  
  // New payment states
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [editingSalaryId, setEditingSalaryId] = useState<string | null>(null);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payWorkerId, setPayWorkerId] = useState('');
  const [payAmount, setPayAmount] = useState(0);
  const [payType, setPayType] = useState<'Monthly' | 'Advance'>('Monthly');
  const [payNote, setPayNote] = useState('');

  // Daily Wage / Salary calculations
  const attendanceForSelectedDate = useMemo(() => {
    return workers.map(w => {
      const record = attendance.find(r => r.date === attendanceDate && r.workerId === w.id);
      return {
        worker: w,
        record
      };
    });
  }, [workers, attendance, attendanceDate]);

  const handleAttendanceChange = (worker: Worker, status: 'Present' | 'Absent' | 'Late', inTime: string, outTime: string) => {
    const newRecord: AttendanceRecord = {
      id: `att-${worker.id}-${attendanceDate}`,
      date: attendanceDate,
      workerId: worker.id,
      workerName: worker.name,
      checkIn: inTime,
      checkOut: outTime,
      status
    };
    onLogAttendance(newRecord);
  };

  const handleEditSalaryClick = (s: SalaryPayment) => {
    setEditingSalaryId(s.id);
    setPayDate(s.date || new Date().toISOString().split('T')[0]);
    setPayWorkerId(s.workerId);
    setPayAmount(s.amount);
    setPayType(s.type);
    setPayNote(s.note || '');
    setIsPayModalOpen(true);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payWorkerId || payAmount <= 0) return;
    const worker = workers.find(w => w.id === payWorkerId);
    if (!worker) return;

    const payload = {
      date: payDate,
      workerId: payWorkerId,
      workerName: worker.name,
      amount: Number(payAmount),
      type: payType,
      note: payNote.trim()
    };

    if (editingSalaryId && onUpdateSalary) {
      onUpdateSalary(editingSalaryId, payload);
    } else {
      onPaySalary(payload);
    }

    setIsPayModalOpen(false);
    setEditingSalaryId(null);
    setPayWorkerId('');
    setPayAmount(0);
    setPayNote('');
  };

  return (
    <div className="space-y-6" id="hr-payroll-system">
      {/* Tab Switcher */}
      <div className="flex border-4 border-black bg-white p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md">
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'attendance'
              ? 'bg-teal-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
              : 'bg-white text-black border-2 border-transparent hover:bg-slate-50'
          }`}
        >
          <Clock size={14} className="stroke-[2.5]" />
          উপস্থিতি খাতা (Attendance)
        </button>
        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'payroll'
              ? 'bg-indigo-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
              : 'bg-white text-black border-2 border-transparent hover:bg-slate-50'
          }`}
        >
          <CreditCard size={14} className="stroke-[2.5]" />
          বেতন ও অগ্রিম (Payroll)
        </button>
      </div>

      {activeSubTab === 'attendance' && (
        <div className="space-y-4" id="attendance-section">
          <div className="neo-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-black flex items-center gap-1.5">
                <Clock size={16} className="text-teal-600 stroke-[2.5]" />
                দৈনিক কর্মী উপস্থিতি হিসাব
              </h3>
              <p className="text-[10px] text-slate-700 mt-1">তারিখ সিলেক্ট করে কর্মীদের উপস্থিতি ও সময়সূচী রেকর্ড করুন।</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Calendar size={16} className="text-slate-700" />
              <input
                id="attendance-date-picker"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 border-2 border-black font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000000] focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white border-4 border-black overflow-x-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <table className="w-full text-left border-collapse" id="attendance-table">
              <thead>
                <tr className="bg-slate-100 border-b-4 border-black text-xs font-black uppercase text-black">
                  <th className="py-4 px-4 border-r border-black/10">কর্মী নাম ও মোবাইল</th>
                  <th className="py-4 px-4 border-r border-black/10 text-center">উপস্থিতি স্ট্যাটাস</th>
                  <th className="py-4 px-4 border-r border-black/10 text-center">ইন টাইম (Check In)</th>
                  <th className="py-4 px-4 border-r border-black/10 text-center">আউট টাইম (Check Out)</th>
                  <th className="py-4 px-4 text-center">মজুরি হার (৳)</th>
                </tr>
              </thead>
              <tbody>
                {attendanceForSelectedDate.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs font-bold text-slate-500">
                      কোন কর্মী নিবন্ধিত পাওয়া যায়নি। ইভেন্ট ও কর্মী ট্যাবে গিয়ে কর্মী যোগ করুন।
                    </td>
                  </tr>
                ) : (
                  attendanceForSelectedDate.map(({ worker, record }) => {
                    const currentStatus = record?.status || 'Absent';
                    const currentIn = record?.checkIn || '09:00';
                    const currentOut = record?.checkOut || '18:00';

                    return (
                      <tr key={worker.id} className="border-b-2 border-black/10 hover:bg-slate-50 text-xs font-bold text-black transition">
                        <td className="py-4 px-4 border-r border-black/10">
                          <div>
                            <span className="font-black text-sm">{worker.name}</span>
                            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{toBengaliNumber(worker.mobile)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 border-r border-black/10 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleAttendanceChange(worker, 'Present', currentIn, currentOut)}
                              className={`px-2.5 py-1 border-2 border-black font-black uppercase text-[10px] transition cursor-pointer shadow-[1px_1px_0px_0px_#000000] ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-300 text-black font-black'
                                  : 'bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              উপস্থিত
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(worker, 'Late', currentIn, currentOut)}
                              className={`px-2.5 py-1 border-2 border-black font-black uppercase text-[10px] transition cursor-pointer shadow-[1px_1px_0px_0px_#000000] ${
                                currentStatus === 'Late'
                                  ? 'bg-amber-300 text-black font-black'
                                  : 'bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              বিলম্ব (Late)
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(worker, 'Absent', currentIn, currentOut)}
                              className={`px-2.5 py-1 border-2 border-black font-black uppercase text-[10px] transition cursor-pointer shadow-[1px_1px_0px_0px_#000000] ${
                                currentStatus === 'Absent'
                                  ? 'bg-rose-300 text-black font-black'
                                  : 'bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              অনুপস্থিত
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 border-r border-black/10 text-center">
                          <input
                            type="time"
                            disabled={currentStatus === 'Absent'}
                            value={currentIn}
                            onChange={(e) => handleAttendanceChange(worker, currentStatus, e.target.value, currentOut)}
                            className="px-2 py-1 border-2 border-black font-mono text-[11px] font-bold bg-white focus:outline-none disabled:opacity-50"
                          />
                        </td>
                        <td className="py-4 px-4 border-r border-black/10 text-center">
                          <input
                            type="time"
                            disabled={currentStatus === 'Absent'}
                            value={currentOut}
                            onChange={(e) => handleAttendanceChange(worker, currentStatus, currentIn, e.target.value)}
                            className="px-2 py-1 border-2 border-black font-mono text-[11px] font-bold bg-white focus:outline-none disabled:opacity-50"
                          />
                        </td>
                        <td className="py-4 px-4 text-center font-black font-sans text-teal-700">
                          {formatCurrency(worker.dailyWage)}/দিন
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'payroll' && (
        <div className="space-y-6" id="payroll-section">
          {/* Top Panel Actions & Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-black flex items-center gap-1.5">
                <Users size={16} className="text-indigo-600 stroke-[2.5]" />
                কর্মচারী বেতন ও অগ্রিম হিসাব
              </h3>
              <p className="text-[10px] text-slate-700 mt-1">কর্মচারীদের মাসিক বেতন নির্ধারণ ও অ্যাডভান্স পেমেন্ট ট্র্যাকিং সিস্টেম।</p>
            </div>
            {userRole !== 'Staff' && (
              <button
                onClick={() => {
                  if (workers.length > 0) {
                    setPayWorkerId(workers[0].id);
                    setIsPayModalOpen(true);
                  } else {
                    alert('দয়া করে প্রথমে কর্মী এন্ট্রি করুন!');
                  }
                }}
                className="neo-btn bg-yellow-400 text-black px-4 py-2 flex items-center gap-1 text-xs"
              >
                <Plus size={14} className="stroke-[3]" />
                নতুন পেমেন্ট করুন
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workers payroll list */}
            <div className="lg:col-span-2 bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="text-xs font-black uppercase text-slate-600 mb-4 pb-2 border-b-2 border-black">কর্মীদের বেতন প্রোফাইল তালিকা</h4>
              <div className="space-y-3">
                {workers.map(w => {
                  const paidAdvance = salaries
                    .filter(s => s.workerId === w.id && s.type === 'Advance')
                    .reduce((sum, s) => sum + s.amount, 0);
                  const paidSalary = salaries
                    .filter(s => s.workerId === w.id && s.type === 'Monthly')
                    .reduce((sum, s) => sum + s.amount, 0);

                  const basicSalary = w.monthlySalary || (w.dailyWage * 26); // estimated if not set

                  return (
                    <div key={w.id} className="border-2 border-black p-4 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[2px_2px_0px_0px_#000000]">
                      <div className="space-y-1">
                        <span className="text-sm font-black text-black">{w.name}</span>
                        <span className="block text-[10px] text-slate-500 font-mono">{toBengaliNumber(w.mobile)}</span>
                        <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-300 font-sans">
                            ধরা বেতন: {formatCurrency(basicSalary)}
                          </span>
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 font-sans">
                            অগ্রিম উত্তোলন: {formatCurrency(paidAdvance)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                        <div className="font-sans">
                          <span className="text-[10px] block text-slate-600 font-bold">মোট বেতন পরিশোধিত:</span>
                          <span className="text-base font-black text-emerald-600">{formatCurrency(paidSalary + paidAdvance)}</span>
                        </div>
                        {userRole !== 'Staff' && (
                          <button
                            onClick={() => {
                              setPayWorkerId(w.id);
                              setPayAmount(basicSalary - paidSalary);
                              setIsPayModalOpen(true);
                            }}
                            className="px-2 py-1 bg-white hover:bg-yellow-100 text-[10px] font-black border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer"
                          >
                            টাকা প্রদান
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Last Transactions Logs */}
            <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-600 mb-4 pb-2 border-b-2 border-black">সর্বশেষ বেতন পেমেন্ট সমূহ</h4>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {salaries.length === 0 ? (
                    <div className="py-10 text-center text-[11px] text-slate-500 font-bold">
                      কোন বেতন বা অ্যাডভান্স পরিশোধের রেকর্ড নেই।
                    </div>
                  ) : (
                    [...salaries].reverse().map(s => (
                      <div key={s.id} className="p-3 border-2 border-black bg-slate-50 text-[11px] font-bold text-black space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black">{s.workerName}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase ${
                              s.type === 'Monthly' ? 'bg-emerald-200 border border-emerald-400' : 'bg-amber-200 border border-amber-400'
                            }`}>
                              {s.type === 'Monthly' ? 'মাসিক বেতন' : 'অগ্রিম'}
                            </span>
                            {userRole !== 'Staff' && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditSalaryClick(s)}
                                  className="p-1 border border-black bg-yellow-100 hover:bg-yellow-300 text-black transition cursor-pointer"
                                  title="এডিট করুন"
                                >
                                  <Edit size={11} />
                                </button>
                                {onDeleteSalary && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteSalary(s.id)}
                                    className="p-1 border border-black bg-rose-100 hover:bg-rose-500 hover:text-white text-rose-700 transition cursor-pointer"
                                    title="মুছুন"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>তারিখ: {toBengaliNumber(s.date)}</span>
                          <span className="font-black font-sans text-rose-600">{formatCurrency(s.amount)}</span>
                        </div>
                        {s.note && <p className="text-[10px] text-slate-500 italic mt-1 font-sans border-t border-dashed border-black/10 pt-1">মন্তব্য: {s.note}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 💳 Payment Modal Dialog */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="pay-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => {
                setIsPayModalOpen(false);
                setEditingSalaryId(null);
              }}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3 flex items-center gap-1.5">
              <DollarSign size={18} className="text-indigo-600 stroke-[2.5]" />
              {editingSalaryId ? 'বেতন/অ্যাডভান্স এন্ট্রি এডিট' : 'কর্মী বেতন/অ্যাডভান্স প্রদান'}
            </h3>

            <form onSubmit={handlePaySubmit} className="space-y-4 text-xs font-bold text-black">
              <div>
                <label className="block mb-1">তারিখ *</label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                />
              </div>

              <div>
                <label className="block mb-1">কর্মী নির্বাচন করুন *</label>
                <select
                  value={payWorkerId}
                  onChange={(e) => setPayWorkerId(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                >
                  <option value="">-- নির্বাচন করুন --</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.mobile})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">পেমেন্টের ধরন *</label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as any)}
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                  >
                    <option value="Monthly">মাসিক বেতন (Monthly)</option>
                    <option value="Advance">অগ্রিম (Advance)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">টাকার পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={payAmount || ''}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border-2 border-black font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">বিশেষ মন্তব্য / বিবরণ</label>
                <textarea
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  rows={2}
                  placeholder="যেমন: জুন মাসের বেতন, উৎসব অগ্রিম ইত্যাদি..."
                  className="w-full px-3 py-2 border-2 border-black font-sans font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsPayModalOpen(false);
                    setEditingSalaryId(null);
                  }}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingSalaryId ? 'আপডেট করুন' : 'পেমেন্ট সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
