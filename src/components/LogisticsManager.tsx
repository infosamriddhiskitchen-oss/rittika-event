import React, { useState, useMemo } from 'react';
import { Truck, Users, Plus, X, Fuel, MapPin, ClipboardList, Trash2, Edit } from 'lucide-react';
import { Vehicle, TripLog, UserRole } from '../types';
import { toBengaliNumber, formatCurrency } from '../utils';

interface LogisticsManagerProps {
  vehicles: Vehicle[];
  trips: TripLog[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  onUpdateVehicle: (id: string, vehicle: Omit<Vehicle, 'id'>) => void;
  onDeleteVehicle: (id: string) => void;
  onAddTrip: (trip: Omit<TripLog, 'id'>) => void;
  onUpdateTrip?: (id: string, trip: Omit<TripLog, 'id'>) => void;
  onDeleteTrip?: (id: string) => void;
  userRole: UserRole;
}

export default function LogisticsManager({
  vehicles,
  trips,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onAddTrip,
  onUpdateTrip,
  onDeleteTrip,
  userRole
}: LogisticsManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'vehicles' | 'trips'>('vehicles');
  
  // Modals & Form states
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vName, setVName] = useState('');
  const [vPlate, setVPlate] = useState('');
  const [vDriver, setVDriver] = useState('');
  const [vStatus, setVStatus] = useState<'Available' | 'Busy' | 'Maintenance'>('Available');

  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
  const [tripVehicleId, setTripVehicleId] = useState('');
  const [tripDest, setTripDest] = useState('');
  const [tripDriver, setTripDriver] = useState('');
  const [tripFuel, setTripFuel] = useState(0);
  const [tripNote, setTripNote] = useState('');

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName || !vPlate || !vDriver) return;

    const payload = {
      name: vName.trim(),
      plateNo: vPlate.trim(),
      driverName: vDriver.trim(),
      status: vStatus
    };

    if (editingVehicle) {
      onUpdateVehicle(editingVehicle.id, payload);
    } else {
      onAddVehicle(payload);
    }

    setVName('');
    setVPlate('');
    setVDriver('');
    setVStatus('Available');
    setEditingVehicle(null);
    setIsVehicleModalOpen(false);
  };

  const handleTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripVehicleId || !tripDest || tripFuel <= 0) return;

    const selectedV = vehicles.find(v => v.id === tripVehicleId);
    if (!selectedV) return;

    const payload = {
      date: tripDate,
      vehicleId: tripVehicleId,
      vehicleName: selectedV.name + ' (' + selectedV.plateNo + ')',
      destination: tripDest.trim(),
      driverName: tripDriver || selectedV.driverName,
      fuelCost: Number(tripFuel),
      note: tripNote.trim()
    };

    if (editingTripId && onUpdateTrip) {
      onUpdateTrip(editingTripId, payload);
    } else {
      onAddTrip(payload);
    }

    setTripVehicleId('');
    setTripDest('');
    setTripDriver('');
    setTripFuel(0);
    setTripNote('');
    setEditingTripId(null);
    setIsTripModalOpen(false);
  };

  const handleEditTripClick = (t: TripLog) => {
    setEditingTripId(t.id);
    setTripDate(t.date || new Date().toISOString().split('T')[0]);
    setTripVehicleId(t.vehicleId);
    setTripDest(t.destination);
    setTripDriver(t.driverName);
    setTripFuel(t.fuelCost);
    setTripNote(t.note || '');
    setIsTripModalOpen(true);
  };

  const handleEditVehicleClick = (v: Vehicle) => {
    setEditingVehicle(v);
    setVName(v.name || '');
    setVPlate(v.plateNo || '');
    setVDriver(v.driverName || '');
    setVStatus(v.status || 'Available');
    setIsVehicleModalOpen(true);
  };

  return (
    <div className="space-y-6" id="logistics-manager">
      {/* Sub Tabs */}
      <div className="flex border-4 border-black bg-white p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md">
        <button
          onClick={() => setActiveSubTab('vehicles')}
          className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'vehicles'
              ? 'bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
              : 'bg-white text-black border-2 border-transparent hover:bg-slate-50'
          }`}
        >
          <Truck size={14} className="stroke-[2.5]" />
          যানবাহন তালিকা (Vehicles)
        </button>
        <button
          onClick={() => setActiveSubTab('trips')}
          className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'trips'
              ? 'bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
              : 'bg-white text-black border-2 border-transparent hover:bg-slate-50'
          }`}
        >
          <ClipboardList size={14} className="stroke-[2.5]" />
          পরিবহন ট্রিপ লগ (Trips & Fuel)
        </button>
      </div>

      {activeSubTab === 'vehicles' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-black flex items-center gap-1.5">
                <Truck size={16} className="text-teal-700 stroke-[2.5]" />
                ডেকোরেশন পরিবহন ও যানবাহন তালিকা
              </h3>
              <p className="text-[10px] text-slate-700 mt-1">মালামাল আনা-নেওয়ার নিজস্ব গাড়ি, ভাড়া গাড়ি ও চালক ট্র্যাক করুন।</p>
            </div>
            {userRole !== 'Staff' && (
              <button
                onClick={() => {
                  setEditingVehicle(null);
                  setVName('');
                  setVPlate('');
                  setVDriver('');
                  setIsVehicleModalOpen(true);
                }}
                className="neo-btn bg-yellow-400 text-black px-4 py-2 flex items-center gap-1 text-xs"
              >
                <Plus size={14} className="stroke-[3]" />
                নতুন গাড়ি যুক্ত করুন
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(v => (
              <div key={v.id} className="neo-card p-5 space-y-4 hover:translate-y-[-2px] transition duration-150">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-amber-100 text-amber-700 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                    <Truck size={20} className="stroke-[2.5]" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 border-2 border-black text-[9px] font-black uppercase ${
                      v.status === 'Available' ? 'bg-emerald-200' :
                      v.status === 'Busy' ? 'bg-amber-200' : 'bg-rose-200'
                    }`}>
                      {v.status === 'Available' ? 'ফ্রি (Available)' :
                       v.status === 'Busy' ? 'ব্যস্ত (Busy)' : 'সার্ভিসিং (Repair)'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black text-black">{v.name}</h4>
                  <p className="text-xs font-black text-slate-600 font-mono">নম্বর প্লেট: {toBengaliNumber(v.plateNo)}</p>
                  <p className="text-xs font-black text-slate-800 flex items-center gap-1">
                    <Users size={12} className="stroke-[2.5] text-slate-500" />
                    চালক: {v.driverName}
                  </p>
                </div>

                {userRole !== 'Staff' && (
                  <div className="border-t border-dashed border-black/10 pt-3 flex justify-end gap-2 text-[10px]">
                    <button
                      onClick={() => handleEditVehicleClick(v)}
                      className="px-2 py-1 border-2 border-black bg-white hover:bg-slate-100 font-black uppercase cursor-pointer"
                    >
                      সম্পাদনা
                    </button>
                    <button
                      onClick={() => onDeleteVehicle(v.id)}
                      className="px-2 py-1 border-2 border-black bg-rose-50 hover:bg-rose-200 text-rose-700 font-black uppercase cursor-pointer"
                    >
                      মুছে ফেলুন
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'trips' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-black flex items-center gap-1.5">
                <Fuel size={16} className="text-amber-600 stroke-[2.5]" />
                ট্রিপ জ্বালানি ও যাতায়াত খরচ লগ
              </h3>
              <p className="text-[10px] text-slate-700 mt-1">ডেকোরেশনের পণ্য সরবরাহের ট্রিপ লগ। ট্রিপ ফুয়েল খরচ স্বয়ংক্রিয়ভাবে খরচ ডায়েরিতে যুক্ত হবে।</p>
            </div>
            <button
              onClick={() => {
                if (vehicles.length > 0) {
                  setTripVehicleId(vehicles[0].id);
                  setTripDriver(vehicles[0].driverName);
                  setTripDest('');
                  setTripFuel(0);
                  setTripNote('');
                  setIsTripModalOpen(true);
                } else {
                  alert('দয়া করে প্রথমে লজিস্টিকসে গাড়ি এন্ট্রি করুন!');
                }
              }}
              className="neo-btn bg-yellow-400 text-black px-4 py-2 flex items-center gap-1 text-xs"
            >
              <Plus size={14} className="stroke-[3]" />
              নতুন ট্রিপ লগ করুন
            </button>
          </div>

          <div className="bg-white border-4 border-black overflow-x-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <table className="w-full text-left border-collapse" id="trips-table">
              <thead>
                <tr className="bg-slate-100 border-b-4 border-black text-xs font-black uppercase text-black">
                  <th className="py-4 px-4 border-r border-black/10">তারিখ</th>
                  <th className="py-4 px-4 border-r border-black/10">যানবাহন নাম</th>
                  <th className="py-4 px-4 border-r border-black/10">গন্তব্য ও চালক</th>
                  <th className="py-4 px-4 border-r border-black/10 text-right">জ্বালানি খরচ (৳)</th>
                  <th className="py-4 px-4 border-r border-black/10">মন্তব্য/নোট</th>
                  <th className="py-4 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs font-bold text-slate-500 uppercase">
                      কোন ট্রিপ বা যাতায়াতের রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  [...trips].reverse().map(t => (
                    <tr key={t.id} className="border-b-2 border-black/10 hover:bg-slate-50 text-xs font-bold text-black transition">
                      <td className="py-4 px-4 border-r border-black/10 font-sans">{toBengaliNumber(t.date)}</td>
                      <td className="py-4 px-4 border-r border-black/10 font-sans text-amber-800">{t.vehicleName}</td>
                      <td className="py-4 px-4 border-r border-black/10">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-rose-500" />
                          <span>{t.destination}</span>
                        </div>
                        <span className="block text-[10px] text-slate-500 mt-0.5">চালক: {t.driverName}</span>
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right font-black font-sans text-red-600">
                        {formatCurrency(t.fuelCost)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-slate-600 text-xs max-w-[200px] truncate" title={t.note}>
                        {t.note || '-'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditTripClick(t)}
                            className="p-1 border border-black bg-yellow-100 hover:bg-yellow-300 text-black transition cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Edit size={12} />
                          </button>
                          {onDeleteTrip && (
                            <button
                              type="button"
                              onClick={() => onDeleteTrip(t.id)}
                              className="p-1 border border-black bg-rose-100 hover:bg-rose-500 hover:text-white text-rose-700 transition cursor-pointer"
                              title="মুছুন"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🚚 Vehicle Add Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="vehicle-add-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setIsVehicleModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3 flex items-center gap-1.5">
              <Truck size={18} className="text-teal-700 stroke-[2.5]" />
              {editingVehicle ? 'গাড়ির তথ্য সংশোধন করুন' : 'নতুন ডেকোরেশন গাড়ি যুক্ত করুন'}
            </h3>

            <form onSubmit={handleVehicleSubmit} className="space-y-4 text-xs font-bold text-black">
              <div>
                <label className="block mb-1">গাড়ির নাম / বিবরণ *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ১ টন পিকআপ, ঢাকা মেগা ট্রাক"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">নম্বর প্লেট কোড *</label>
                  <input
                    type="text"
                    required
                    placeholder="ঢাকা মেট্রো-ন ১১-২২৩৩"
                    value={vPlate}
                    onChange={(e) => setVPlate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1">চালকের নাম (Driver) *</label>
                  <input
                    type="text"
                    required
                    placeholder="রহমত মিয়া"
                    value={vDriver}
                    onChange={(e) => setVDriver(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">গাড়ির অবস্থা (Status)</label>
                <select
                  value={vStatus}
                  onChange={(e) => setVStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                >
                  <option value="Available">ফ্রি (Available)</option>
                  <option value="Busy">ব্যস্ত (Busy)</option>
                  <option value="Maintenance">সার্ভিসিং / গ্যারেজে (Maintenance)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingVehicle ? 'আপডেট করুন' : 'গাড়ি সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⛽ Trip Log Modal */}
      {isTripModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="trip-add-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => {
                setIsTripModalOpen(false);
                setEditingTripId(null);
              }}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3 flex items-center gap-1.5">
              <Fuel size={18} className="text-amber-600 stroke-[2.5]" />
              {editingTripId ? 'পরিবহন ট্রিপ ও খরচ সংশোধন করুন' : 'নতুন মালামাল পরিবহন ট্রিপ লগ করুন'}
            </h3>

            <form onSubmit={handleTripSubmit} className="space-y-4 text-xs font-bold text-black">
              <div>
                <label className="block mb-1">তারিখ *</label>
                <input
                  type="date"
                  required
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                />
              </div>

              <div>
                <label className="block mb-1">গাড়ি নির্বাচন করুন *</label>
                <select
                  value={tripVehicleId}
                  onChange={(e) => {
                    setTripVehicleId(e.target.value);
                    const selected = vehicles.find(v => v.id === e.target.value);
                    if (selected) setTripDriver(selected.driverName);
                  }}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                >
                  <option value="">-- নির্বাচন করুন --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.plateNo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">ডেকোরেশন লোকেশন / গন্তব্য *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সেনামালঞ্চ হল ১, গুলশান ২ শুটিং ক্লাব"
                  value={tripDest}
                  onChange={(e) => setTripDest(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">চালকের নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="গাড়ির নির্ধারিত চালক"
                    value={tripDriver}
                    onChange={(e) => setTripDriver(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1">জ্বালানি/ফুয়েল খরচ (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="১,৫০০"
                    value={tripFuel || ''}
                    onChange={(e) => setTripFuel(Number(e.target.value))}
                    className="w-full px-3 py-2 border-2 border-black font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">বিশেষ বিবরণ / ট্রিপ নোট</label>
                <textarea
                  value={tripNote}
                  onChange={(e) => setTripNote(e.target.value)}
                  rows={2}
                  placeholder="যেমন: বরযাত্রী গেটের মালামাল আনা-নেওয়া..."
                  className="w-full px-3 py-2 border-2 border-black font-sans font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsTripModalOpen(false);
                    setEditingTripId(null);
                  }}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingTripId ? 'ট্রিপ আপডেট করুন' : 'ট্রিপ ও খরচ রেকর্ড সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
