import React, { useState } from 'react';
import { Staff } from '../../types';
import { StaffCard } from './StaffCard';
import { Users, Filter, ShieldCheck, HeartHandshake } from 'lucide-react';

interface StaffGridProps {
  staffList: Staff[];
  showFilters?: boolean;
}

export const StaffGrid: React.FC<StaffGridProps> = ({
  staffList,
  showFilters = true,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const roleCategories = [
    { id: 'all', label: 'All Team Members' },
    { id: 'owner', label: 'Executive Leadership' },
    { id: 'manager', label: 'Management' },
    { id: 'concierge', label: 'Guest Services' },
    { id: 'security', label: 'Compound Security' },
    { id: 'hospitality', label: 'Housekeeping' },
  ];

  const filteredStaff = selectedRole === 'all'
    ? staffList
    : staffList.filter((s) => s.role === selectedRole);

  return (
    <div className="space-y-8">
      {/* Role Filter Pills */}
      {showFilters && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-1.5 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Department:
          </span>

          {roleCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedRole(cat.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                selectedRole === cat.id
                  ? 'bg-[#C5A059] text-black font-bold shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Staff Count Notice */}
      <div className="flex items-center justify-between text-xs font-mono text-white/50 border-b border-white/10 pb-3">
        <span className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-[#C5A059]" />
          Displaying <strong>{filteredStaff.length}</strong> staff profile record(s)
        </span>
        <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-semibold">
          Data-Driven • PostgreSQL Compatible
        </span>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <StaffCard
            key={staff.id}
            staff={staff}
            featured={staff.role === 'owner'}
          />
        ))}
      </div>
    </div>
  );
};
