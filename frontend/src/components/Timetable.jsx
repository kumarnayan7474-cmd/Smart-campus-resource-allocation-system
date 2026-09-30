import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';

export default function Timetable({ bookings = [], resources = [] }) {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedType, setSelectedType] = useState('all');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const slots = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]; // 8:00 to 18:00 (10 slots)

  const filteredResources = resources.filter(r => selectedType === 'all' || r.type === selectedType);

  const getBookingForSlot = (resId, hour) => {
    return bookings.find(b => 
      b.resource_id === resId &&
      b.day === selectedDay &&
      hour >= b.start_slot &&
      hour < b.end_slot
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="glass-panel p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100">Resource Timetable Matrix (8:00 - 18:00)</h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Day selection */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedDay === day
                    ? 'bg-cyan-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Types</option>
              <option value="classroom">Classroom</option>
              <option value="lab">Lab</option>
              <option value="seminar_hall">Seminar Hall</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid view */}
      <div className="glass-panel p-5 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-mono uppercase text-slate-400">
              <th className="py-3 px-4 min-w-[200px] bg-slate-900/50 sticky left-0 z-10 border-r border-slate-800">
                Resource Name
              </th>
              {slots.map(s => (
                <th key={s} className="py-3 px-2 text-center border-r border-slate-800 min-w-[85px]">
                  {s}:00-{s+1}:00
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredResources.map(res => (
              <tr key={res.id} className="hover:bg-slate-900/30">
                <td className="py-3 px-4 bg-slate-900/80 sticky left-0 z-10 border-r border-slate-800">
                  <div className="font-bold text-slate-200 text-sm">{res.name}</div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                    <span className="capitalize">{res.type}</span>
                    <span>•</span>
                    <span className="font-mono">Cap: {res.capacity}</span>
                  </div>
                </td>

                {slots.map(s => {
                  const booking = getBookingForSlot(res.id, s);
                  return (
                    <td key={s} className="p-1 border-r border-slate-800/60 text-center h-16 relative">
                      {booking ? (
                        <div
                          className="w-full h-full bg-cyan-500/20 border border-cyan-500/40 rounded p-1.5 flex flex-col justify-between text-left hover:bg-cyan-500/30 transition cursor-pointer group"
                          title={`${booking.requester} (${booking.request_type}) - Priority: ${booking.priority_score}`}
                        >
                          <div className="text-[11px] font-bold text-cyan-300 truncate">
                            {booking.requester}
                          </div>
                          <div className="text-[10px] text-cyan-400/80 capitalize font-mono truncate">
                            Prio: {booking.priority_score}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full rounded border border-dashed border-slate-800/40 hover:border-slate-700/60 transition flex items-center justify-center">
                          <span className="text-[10px] text-slate-700">Free</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
