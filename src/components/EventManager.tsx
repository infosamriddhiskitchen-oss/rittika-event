import React, { useState, useMemo } from 'react';
import { Plus, Check, ClipboardList, Users, Phone, ShieldCheck, X, Briefcase, ChevronRight, UserCheck, Edit, Trash2 } from 'lucide-react';
import { StockItem, Customer, EventEntry, Worker, EventMaterial } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils';

interface EventManagerProps {
  events: EventEntry[];
  customers: Customer[];
  stockItems: StockItem[];
  workers: Worker[];
  onAddEvent: (event: Omit<EventEntry, 'id'>) => void;
  onUpdateEventMaterials: (eventId: string, materials: EventMaterial[]) => void;
  onUpdateEventStatus: (eventId: string, status: 'Pending' | 'Ongoing' | 'Completed') => void;
  onAddWorker: (worker: Omit<Worker, 'id'>) => void;
  onUpdateEvent?: (id: string, event: Omit<EventEntry, 'id'>) => void;
  onDeleteEvent?: (id: string) => void;
  onUpdateWorker?: (id: string, worker: Omit<Worker, 'id'>) => void;
  onDeleteWorker?: (id: string) => void;
}

export default function EventManager({
  events,
  customers,
  stockItems,
  workers,
  onAddEvent,
  onUpdateEventMaterials,
  onUpdateEventStatus,
  onAddWorker,
  onUpdateEvent,
  onDeleteEvent,
  onUpdateWorker,
  onDeleteWorker
}: EventManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'events' | 'workers'>('events');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventEntry | null>(null);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Selected event for checklist management
  const [activeChecklistEvent, setActiveChecklistEvent] = useState<EventEntry | null>(null);

  // Event form states
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [budget, setBudget] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState('');
  // Material addition inside new event form
  const [selectedMaterials, setSelectedMaterials] = useState<{ itemCode: string; qty: number }[]>([]);
  const [tempMaterialCode, setTempMaterialCode] = useState(stockItems[0]?.code || '');
  const [tempMaterialQty, setTempMaterialQty] = useState(1);

  // Worker form states
  const [workerName, setWorkerName] = useState('');
  const [workerMobile, setWorkerMobile] = useState('');
  const [workerWage, setWorkerWage] = useState(500);
  const [workerNote, setWorkerNote] = useState('');

  // Checklist helper states (adding materials on the fly)
  const [liveChecklistCode, setLiveChecklistCode] = useState(stockItems[0]?.code || '');
  const [liveChecklistQty, setLiveChecklistQty] = useState(1);

  const handleEditEventClick = (evt: EventEntry) => {
    setEditingEvent(evt);
    setEventName(evt.name || '');
    setEventDate(evt.date || '');
    setCustomerId(evt.customerId || '');
    setBudget(evt.budget || 0);
    setPaidAmount(evt.paidAmount || 0);
    setNote(evt.note || '');
    setSelectedMaterials((evt.materials || []).map(m => ({ itemCode: m.itemCode || '', qty: m.qty || 0 })));
    setIsAddEventOpen(true);
  };

  const handleEditWorkerClick = (w: Worker) => {
    setEditingWorker(w);
    setWorkerName(w.name || '');
    setWorkerMobile(w.mobile || '');
    setWorkerWage(w.dailyWage || 0);
    setWorkerNote(w.notes || '');
    setIsAddWorkerOpen(true);
  };

  const totalEventBudget = useMemo(() => {
    return events.reduce((sum, e) => sum + e.budget, 0);
  }, [events]);

  const totalEventPaid = useMemo(() => {
    return events.reduce((sum, e) => sum + e.paidAmount, 0);
  }, [events]);

  const totalEventDue = useMemo(() => {
    return events.reduce((sum, e) => sum + e.dueAmount, 0);
  }, [events]);

  // Handle adding material to list in event form
  const handleAddMaterialToDraft = () => {
    if (!tempMaterialCode || tempMaterialQty <= 0) return;
    // Check if duplicate
    if (selectedMaterials.some(m => m.itemCode === tempMaterialCode)) {
      alert('এই আইটেমটি ইতিমধ্যে ড্রাফটে যোগ করা হয়েছে!');
      return;
    }
    setSelectedMaterials([...selectedMaterials, { itemCode: tempMaterialCode, qty: tempMaterialQty }]);
    setTempMaterialQty(1);
  };

  const handleRemoveMaterialFromDraft = (code: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.itemCode !== code));
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !customerId || budget <= 0) {
      alert('অনুগ্রহ করে সঠিক বাজেট ও কাস্টমার নির্বাচন করুন!');
      return;
    }

    const due = Math.max(0, budget - paidAmount);
    
    // Map drafted materials with default checked = false
    const materialsList: EventMaterial[] = selectedMaterials.map(m => {
      const existing = editingEvent?.materials.find(em => em.itemCode === m.itemCode);
      return {
        itemCode: m.itemCode,
        qty: m.qty,
        checked: existing ? existing.checked : false
      };
    });

    const payload = {
      name: eventName.trim(),
      date: eventDate,
      customerId,
      budget: Number(budget),
      paidAmount: Number(paidAmount),
      dueAmount: due,
      materials: materialsList,
      status: editingEvent ? editingEvent.status : 'Pending' as const,
      note: note.trim()
    };

    if (editingEvent && onUpdateEvent) {
      onUpdateEvent(editingEvent.id, payload);
    } else {
      onAddEvent(payload);
    }

    // Reset States
    setEventName('');
    setBudget(0);
    setPaidAmount(0);
    setNote('');
    setSelectedMaterials([]);
    setEditingEvent(null);
    setIsAddOpenEvent(false);
  };

  // Safe wrapper for modal opening
  const setIsAddOpenEvent = (open: boolean) => {
    setIsAddEventOpen(open);
    if (!open) {
      setEditingEvent(null);
      setEventName('');
      setBudget(0);
      setPaidAmount(0);
      setNote('');
      setSelectedMaterials([]);
    } else if (stockItems.length > 0) {
      setTempMaterialCode(stockItems[0].code);
    }
  };

  const handleSubmitWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerName || !workerMobile) return;

    const payload = {
      name: workerName.trim(),
      mobile: workerMobile.trim(),
      dailyWage: Number(workerWage),
      notes: workerNote.trim()
    };

    if (editingWorker && onUpdateWorker) {
      onUpdateWorker(editingWorker.id, payload);
    } else {
      onAddWorker(payload);
    }

    setWorkerName('');
    setWorkerMobile('');
    setWorkerWage(500);
    setWorkerNote('');
    setEditingWorker(null);
    setIsAddWorkerOpen(false);
  };

  // Checklist Interactive check/uncheck
  const handleToggleChecklistCheckbox = (itemCode: string) => {
    if (!activeChecklistEvent) return;
    const updated = activeChecklistEvent.materials.map(m => {
      if (m.itemCode === itemCode) {
        return { ...m, checked: !m.checked };
      }
      return m;
    });
    onUpdateEventMaterials(activeChecklistEvent.id, updated);
    // Sync local selection
    setActiveChecklistEvent({
      ...activeChecklistEvent,
      materials: updated
    });
  };

  // Add material inside checklist manager on the fly
  const handleAddLiveChecklistItem = () => {
    if (!activeChecklistEvent || !liveChecklistCode || liveChecklistQty <= 0) return;
    
    const exists = activeChecklistEvent.materials.some(m => m.itemCode === liveChecklistCode);
    if (exists) {
      alert('এই আইটেমটি ইতিমধ্যে তালিকায় রয়েছে!');
      return;
    }

    const updated = [
      ...activeChecklistEvent.materials,
      { itemCode: liveChecklistCode, qty: liveChecklistQty, checked: false }
    ];

    onUpdateEventMaterials(activeChecklistEvent.id, updated);
    setActiveChecklistEvent({
      ...activeChecklistEvent,
      materials: updated
    });
    setLiveChecklistQty(1);
  };

  // Remove material inside checklist manager on the fly
  const handleRemoveLiveChecklistItem = (code: string) => {
    if (!activeChecklistEvent) return;
    const updated = activeChecklistEvent.materials.filter(m => m.itemCode !== code);
    onUpdateEventMaterials(activeChecklistEvent.id, updated);
    setActiveChecklistEvent({
      ...activeChecklistEvent,
      materials: updated
    });
  };

  return (
    <div className="space-y-8" id="event-manager-tab">
      
      {/* Header action row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-black">ইভেন্ট ও কর্মী পরিচালনা (Event & Workers)</h2>
          <p className="text-sm font-bold text-slate-700 mt-1">বিয়ে বা গায়ে হলুদের ডেকরেশন ডিজাইন, চেকলিস্ট লোডিং এবং লেবার মজুরি এক জায়গায় ট্র্যাকিং।</p>
        </div>
        <button
          id={`add-btn-${activeSubTab}`}
          onClick={() => {
            if (activeSubTab === 'events') {
              setEditingEvent(null);
              setEventName('');
              setEventDate(new Date().toISOString().split('T')[0]);
              setCustomerId(customers[0]?.id || '');
              setBudget(0);
              setPaidAmount(0);
              setNote('');
              setSelectedMaterials([]);
              setIsAddEventOpen(true);
            } else {
              setEditingWorker(null);
              setWorkerName('');
              setWorkerMobile('');
              setWorkerWage(500);
              setWorkerNote('');
              setIsAddWorkerOpen(true);
            }
          }}
          className="neo-btn neo-btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
        >
          <Plus size={16} className="stroke-[2.5]" />
          {activeSubTab === 'events' ? 'নতুন ইভেন্ট বুকিং করুন' : 'নতুন কর্মী যোগ করুন'}
        </button>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex border-b-4 border-black gap-2 mt-4" id="event-toggle-tabs">
        <button
          id="toggle-events-subtab"
          onClick={() => setActiveSubTab('events')}
          className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-x-3 border-t-3 border-black transition cursor-pointer relative -bottom-[4px] ${
            activeSubTab === 'events' 
              ? 'bg-yellow-400 text-black' 
              : 'bg-white text-slate-600 hover:text-black border-b-3 border-b-black'
          }`}
        >
          ইভেন্টসমূহ ও চেকলিস্ট ({toBengaliNumber(events.length)} টি ইভেন্ট)
        </button>
        <button
          id="toggle-workers-subtab"
          onClick={() => setActiveSubTab('workers')}
          className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-x-3 border-t-3 border-black transition cursor-pointer relative -bottom-[4px] ${
            activeSubTab === 'workers' 
              ? 'bg-yellow-400 text-black' 
              : 'bg-white text-slate-600 hover:text-black border-b-3 border-b-black'
          }`}
        >
          শ্রমিক / কর্মী ও মজুরি ({toBengaliNumber(workers.length)} জন)
        </button>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'events' ? (
        <div className="space-y-8" id="events-module">
          
          {/* Stats Summary widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="event-stats">
            
            {/* Total Event Budget */}
            <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
              <div>
                <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট ইভেন্ট বাজেট</span>
                <span className="text-2xl font-black text-slate-800 block mt-1">
                  {formatCurrency(totalEventBudget)}
                </span>
                <span className="text-xs text-black font-black mt-1 block">ডেকোরেশন চুক্তি মূল্য</span>
              </div>
              <div className="w-12 h-12 border-3 border-black bg-teal-300 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <ClipboardList size={22} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Advance collected */}
            <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
              <div>
                <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">অগ্রিম সংগৃহীত বিল</span>
                <span className="text-2xl font-black text-emerald-600 block mt-1">
                  {formatCurrency(totalEventPaid)}
                </span>
                <span className="text-xs text-black font-black mt-1 block">প্রাপ্ত জমা বা ক্যাশ ইন</span>
              </div>
              <div className="w-12 h-12 border-3 border-black bg-emerald-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <ShieldCheck size={22} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Total Event due */}
            <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
              <div>
                <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">বকেয়া ইভেন্ট বিল (Due)</span>
                <span className="text-2xl font-black text-rose-600 block mt-1">
                  {formatCurrency(totalEventDue)}
                </span>
                <span className="text-xs text-black font-black mt-1 block">পরিশোধের অপেক্ষায় বকেয়া</span>
              </div>
              <div className="w-12 h-12 border-3 border-black bg-rose-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <X size={22} className="stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Events booking list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="events-grid-list">
            {events.length === 0 ? (
              <div className="col-span-full py-10 text-center text-sm font-bold text-black uppercase border-4 border-dashed border-black">
                কোন বুকিং ইভেন্ট নেই।
              </div>
            ) : (
              events.map(ev => {
                const customer = customers.find(c => c.id === ev.customerId);
                const checkedMaterials = ev.materials.filter(m => m.checked).length;
                const totalMaterials = ev.materials.length;

                return (
                  <div key={ev.id} className="neo-card p-5 flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b-2 border-black pb-2 gap-2">
                        <span className="text-xs font-black text-slate-700 font-mono">তারিখ: {toBengaliNumber(ev.date)}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <select
                            id={`status-select-${ev.id}`}
                            value={ev.status}
                            onChange={(e) => onUpdateEventStatus(ev.id, e.target.value as any)}
                            className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black bg-white cursor-pointer ${
                              ev.status === 'Completed' ? 'bg-emerald-300 text-black shadow-[1px_1px_0px_0px_#000000]' :
                              ev.status === 'Ongoing' ? 'bg-amber-300 text-black shadow-[1px_1px_0px_0px_#000000]' :
                              'bg-slate-300 text-black shadow-[1px_1px_0px_0px_#000000]'
                            }`}
                          >
                            <option value="Pending">বুকড (Pending)</option>
                            <option value="Ongoing">চলমান (Ongoing)</option>
                            <option value="Completed">সম্পন্ন (Completed)</option>
                          </select>
                          <button
                            onClick={() => handleEditEventClick(ev)}
                            className="p-1.5 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                            title="সম্পাদনা করুন"
                          >
                            <Edit size={11} className="stroke-[2.5]" />
                          </button>
                          {onDeleteEvent && (
                            <button
                              onClick={() => onDeleteEvent(ev.id)}
                              className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-500 hover:text-white text-red-700 transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={11} className="stroke-[2.5]" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-black uppercase italic tracking-tight">{ev.name}</h4>
                        <p className="text-xs font-bold text-slate-800 mt-1">গ্রাহক: {customer ? customer.name : 'অজানা গ্রাহক'} ({customer?.mobile})</p>
                      </div>

                      {ev.note && <p className="text-xs text-slate-600 font-bold italic">নোট: {ev.note}</p>}

                      {/* Advance & Due Progress visual */}
                      <div className="space-y-2 border-2 border-black p-2.5 bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[11px] font-black">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-700">অগ্রিম: {formatCurrency(ev.paidAmount)}</span>
                          <span className="text-rose-600">বকেয়া: {formatCurrency(ev.dueAmount)}</span>
                          <span className="text-black">বাজেট: {formatCurrency(ev.budget)}</span>
                        </div>
                        <div className="w-full h-3 bg-white border-2 border-black overflow-hidden rounded-none">
                          <div 
                            className="h-full bg-yellow-400 border-r-2 border-black transition-all duration-300"
                            style={{ width: `${Math.min(100, (ev.paidAmount / ev.budget) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Materials Checklist Status Button */}
                    <div className="flex gap-2 mt-5 border-t-2 border-black pt-3 justify-between items-center text-xs">
                      <span className="font-black text-slate-700 font-mono">
                        লোড লিস্ট: {toBengaliNumber(checkedMaterials)}/{toBengaliNumber(totalMaterials)} রেডি
                      </span>
                      <button
                        id={`open-checklist-${ev.id}`}
                        onClick={() => {
                          setActiveChecklistEvent(ev);
                          if (stockItems.length > 0) {
                            setLiveChecklistCode(stockItems[0].code);
                          }
                        }}
                        className="px-3 py-1.5 bg-teal-300 hover:bg-teal-400 text-black border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer"
                      >
                        <ClipboardList size={13} className="inline mr-1 stroke-[2.5]" />
                        চেকলিস্ট মেলান
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      ) : (
        // Workers module layout
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn" id="workers-module">
          {workers.length === 0 ? (
            <div className="col-span-full py-10 text-center text-sm font-bold text-black uppercase border-4 border-dashed border-black">
              কোন কর্মীর তথ্য যোগ করা হয়নি।
            </div>
          ) : (
            workers.map(w => (
              <div key={w.id} className="neo-card p-5 flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Users size={18} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-black">{w.name}</h4>
                        <p className="text-xs font-black text-slate-700 font-mono mt-0.5">{toBengaliNumber(w.mobile)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditWorkerClick(w)}
                        className="p-1.5 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                        title="সম্পাদনা করুন"
                      >
                        <Edit size={11} className="stroke-[2.5]" />
                      </button>
                      {onDeleteWorker && (
                        <button
                          onClick={() => onDeleteWorker(w.id)}
                          className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-500 hover:text-white text-red-700 transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={11} className="stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs bg-slate-50 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-black">
                    <span className="text-slate-600">দৈনিক মজুরি:</span>
                    <span className="font-extrabold text-indigo-700 font-sans">{formatCurrency(w.dailyWage)}</span>
                  </div>

                  {w.notes && (
                    <p className="text-xs font-bold text-slate-600 italic">দক্ষতা: {w.notes}</p>
                  )}
                </div>

                <div className="flex gap-2 mt-5 border-t-2 border-black pt-3">
                  <a
                    id={`dial-worker-${w.mobile}`}
                    href={`tel:${w.mobile}`}
                    className="flex-1 py-1.5 bg-white text-black border-2 border-black font-black text-[10px] uppercase italic text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100"
                  >
                    <Phone size={11} className="inline mr-1 stroke-[2.5]" />
                    সরাসরি কল
                  </a>
                  <a
                    id={`wa-worker-${w.mobile}`}
                    href={`https://wa.me/${w.mobile.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 bg-emerald-400 text-black border-2 border-black font-black text-[10px] uppercase italic text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-500"
                  >
                    হোয়াটসঅ্যাপ
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 📋 Event Material Checklist Modal */}
      {activeChecklistEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="checklist-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setActiveChecklistEvent(null)}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <div className="border-b-3 border-black pb-3 mb-4">
              <h3 className="text-lg font-black uppercase italic text-black flex items-center gap-1.5">
                <ClipboardList size={18} className="text-teal-600 stroke-[2.5]" />
                ইভেন্ট সামগ্রী চেকলিস্ট (Loading Checklist)
              </h3>
              <p className="text-xs font-bold text-slate-700 mt-1">ইভেন্ট: <span className="font-black text-black">{activeChecklistEvent.name}</span></p>
            </div>

            {/* Quick adding of live item onto the checklist */}
            <div className="bg-slate-100 p-3 border-2 border-black text-xs font-black text-black flex items-end gap-2 mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">সামগ্রী যুক্ত করুন:</label>
                <select
                  value={liveChecklistCode}
                  onChange={(e) => setLiveChecklistCode(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border-2 border-black rounded-none font-bold"
                >
                  {stockItems.map(i => (
                    <option key={i.code} value={i.code}>{i.code} - {i.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-20">
                <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">পরিমাণ:</label>
                <input
                  type="number"
                  min="1"
                  value={liveChecklistQty}
                  onChange={(e) => setLiveChecklistQty(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border-2 border-black rounded-none font-bold"
                />
              </div>
              <button
                id="add-live-checklist-item"
                onClick={handleAddLiveChecklistItem}
                className="px-3 py-1.5 bg-teal-300 hover:bg-teal-400 text-black border-2 border-black font-black rounded-none shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
              >
                যুক্ত করুন
              </button>
            </div>

            {/* Material checks checklist items list */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {activeChecklistEvent.materials.length === 0 ? (
                <p className="text-xs text-slate-600 italic text-center py-6 font-bold uppercase">এই ইভেন্টের সাথে কোনো মালামাল লিংক করা নেই।</p>
              ) : (
                activeChecklistEvent.materials.map(m => {
                  const masterItem = stockItems.find(i => i.code === m.itemCode);

                  return (
                    <div 
                      key={m.itemCode} 
                      className={`flex items-center justify-between p-3 border-2 border-black transition ${
                        m.checked 
                          ? 'bg-teal-50 border-teal-400 text-slate-700' 
                          : 'bg-white border-black text-black'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          id={`checkbox-toggle-${m.itemCode}`}
                          onClick={() => handleToggleChecklistCheckbox(m.itemCode)}
                          className={`w-6 h-6 border-2 border-black flex items-center justify-center transition cursor-pointer ${
                            m.checked 
                              ? 'bg-teal-500 text-black shadow-[1px_1px_0px_0px_#000000]' 
                              : 'bg-white hover:bg-slate-100 shadow-[1px_1px_0px_0px_#000000]'
                          }`}
                        >
                          {m.checked && <Check size={16} className="stroke-[3]" />}
                        </button>
                        <div>
                          <p className={`text-xs font-black ${m.checked ? 'line-through text-slate-500' : 'text-black'}`}>
                            {masterItem ? masterItem.name : m.itemCode}
                          </p>
                          <span className="text-[10px] font-mono font-black text-slate-600 uppercase">{m.itemCode}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black font-mono text-teal-800 bg-teal-100 border-2 border-teal-500 px-2 py-0.5 shadow-[1px_1px_0px_0px_#115e59]">
                          {toBengaliNumber(m.qty)} {masterItem?.unit || 'পিস'}
                        </span>
                        <button
                          id={`remove-live-material-${m.itemCode}`}
                          onClick={() => handleRemoveLiveChecklistItem(m.itemCode)}
                          className="p-1 border-2 border-transparent hover:border-black hover:bg-rose-100 text-slate-700 hover:text-rose-600 cursor-pointer"
                        >
                          <X size={12} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
              <button
                onClick={() => setActiveChecklistEvent(null)}
                className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Event Modal Form */}
      {isAddEventOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="event-booking-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsAddOpenEvent(false)}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3 flex items-center gap-1.5">
              <ClipboardList size={18} className="text-teal-600 stroke-[2.5]" />
              {editingEvent ? 'ইভেন্ট বুকিং ও মেটেরিয়াল প্ল্যানার সংশোধন' : 'নতুন ইভেন্ট বুকিং ও মেটেরিয়াল প্ল্যানার'}
            </h3>

            <form onSubmit={handleSubmitEvent} className="space-y-4 text-xs font-bold text-black">
              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">অনুষ্ঠানের নাম (যেমন: গীতশ্রী ও প্রদীপের বিয়ে)</label>
                <input
                  type="text"
                  required
                  placeholder="ইভেন্ট নাম..."
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">তারিখ</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">কাস্টমার (গ্রাহক)</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">মোট বাজেট বা ডেকোরেশন চুক্তি মূল্য (৳)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={budget || ''}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">অগ্রিম পরিশোধের পরিমাণ (৳)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              {/* Event Material Draft adding */}
              <div className="border-3 border-black p-3 bg-slate-50 space-y-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-xs font-black text-black block uppercase">ইভেন্টে ব্যবহৃত সামগ্রী প্ল্যান করুন (ইভেন্ট মেটেরিয়াল):</span>
                
                <div className="flex gap-2 text-xs font-black">
                  <div className="flex-1">
                    <select
                      value={tempMaterialCode}
                      onChange={(e) => setTempMaterialCode(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border-2 border-black font-bold focus:outline-none"
                    >
                      {stockItems.map(item => (
                        <option key={item.code} value={item.code}>{item.code} - {item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={tempMaterialQty}
                      onChange={(e) => setTempMaterialQty(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border-2 border-black font-bold focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMaterialToDraft}
                    className="px-3 py-1.5 bg-indigo-300 text-black border-2 border-black font-black rounded-none shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                  >
                    যুক্ত করুন
                  </button>
                </div>

                {/* Drafted list */}
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                  {selectedMaterials.length === 0 ? (
                    <p className="text-[11px] font-black text-slate-500 italic">এখনো কোনো সামগ্রী প্ল্যান করা হয়নি।</p>
                  ) : (
                    selectedMaterials.map(m => (
                      <div key={m.itemCode} className="flex items-center justify-between text-xs bg-white py-1.5 px-2.5 border-2 border-black font-black text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        <span>{m.itemCode} - {stockItems.find(i => i.code === m.itemCode)?.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-indigo-700 font-mono">{toBengaliNumber(m.qty)} পিস</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterialFromDraft(m.itemCode)}
                            className="p-0.5 border border-transparent hover:border-black hover:bg-rose-100 text-slate-600 hover:text-red-600 rounded-none cursor-pointer"
                          >
                            <X size={10} className="stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">विशेष निर्देशना / নোত</label>
                <textarea
                  placeholder="হলুদ রঙের থিম ডেকোরেশন হবে..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50 h-16 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddOpenEvent(false)}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingEvent ? 'আপডেট করুন' : 'বুকিং সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Worker Modal Form */}
      {isAddWorkerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="worker-add-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => {
                setIsAddWorkerOpen(false);
                setEditingWorker(null);
                setWorkerName('');
                setWorkerMobile('');
                setWorkerWage(500);
                setWorkerNote('');
              }}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3 flex items-center gap-1.5">
              <Users size={18} className="text-indigo-600 stroke-[2.5]" />
              {editingWorker ? 'শ্রমিক/কর্মী তথ্য পরিবর্তন' : 'নতুন শ্রমিক/কর্মী যোগ করুন'}
            </h3>

            <form onSubmit={handleSubmitWorker} className="space-y-4 text-xs font-bold text-black">
              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">শ্রমিকের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সোহেল রানা"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    required
                    placeholder="01911002233"
                    value={workerMobile}
                    onChange={(e) => setWorkerMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">দৈনিক মজুরি (Daily Wage ৳)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={workerWage || ''}
                    onChange={(e) => setWorkerWage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">দক্ষতা / বিশেষ মন্তব্য (নোট)</label>
                <textarea
                  placeholder="যেমন: স্টেজ মেকিং এবং গেট বাঁধার মিস্ত্রি..."
                  value={workerNote}
                  onChange={(e) => setWorkerNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50 h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddWorkerOpen(false);
                    setEditingWorker(null);
                    setWorkerName('');
                    setWorkerMobile('');
                    setWorkerWage(500);
                    setWorkerNote('');
                  }}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingWorker ? 'আপডেট করুন' : 'শ্রমিক সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
