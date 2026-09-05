import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { SuiteCard } from '../components/suites/SuiteCard';
import { EmptyState } from '../components/common/EmptyState';
import { SUITES_DATA } from '../config/business';
import { Building2, Search, Filter, ShieldCheck, Zap } from 'lucide-react';

export const SuitesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialHouse = searchParams.get('house');

  const [selectedHouse, setSelectedHouse] = useState<number | 'all'>(
    initialHouse === '1' ? 1 : initialHouse === '2' ? 2 : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [minOccupancy, setMinOccupancy] = useState<number>(0);

  const filteredSuites = useMemo(() => {
    return SUITES_DATA.filter((suite) => {
      // Filter by House
      if (selectedHouse !== 'all' && suite.houseNumber !== selectedHouse) {
        return false;
      }
      // Filter by Search Query
      if (
        searchQuery &&
        !suite.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !suite.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Filter by Occupancy
      if (minOccupancy > 0 && suite.maxOccupancy < minOccupancy) {
        return false;
      }
      return true;
    });
  }, [selectedHouse, searchQuery, minOccupancy]);

  const handleHouseChange = (house: number | 'all') => {
    setSelectedHouse(house);
    if (house === 'all') {
      searchParams.delete('house');
    } else {
      searchParams.set('house', house.toString());
    }
    setSearchParams(searchParams);
  };

  return (
    <>
      <SEOHead configKey="suites" />

      <PageHeader
        title="Official Executive Suites"
        subtitle="Discover our 12 private, climate-controlled suites housed across House 1 and House 2 in Tabokoto, Soma."
        breadcrumbs={[{ label: 'Suites' }]}
        bgTag="House 1 & House 2 Accommodations"
      />

      <Section background="default" padding="lg">
        <Container size="xl">
          {/* Controls Bar */}
          <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 shadow-xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Filter Tabs: House Selection */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A059] flex items-center gap-1.5 mr-2 shrink-0">
                <Filter className="w-3.5 h-3.5" /> House Filter:
              </span>

              <button
                type="button"
                onClick={() => handleHouseChange('all')}
                className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                  selectedHouse === 'all'
                    ? 'bg-[#C5A059] text-black font-bold shadow'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                All 12 Suites
              </button>

              <button
                type="button"
                onClick={() => handleHouseChange(1)}
                className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                  selectedHouse === 1
                    ? 'bg-[#C5A059] text-black font-bold shadow'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                House 1 (Suites 01 - 06)
              </button>

              <button
                type="button"
                onClick={() => handleHouseChange(2)}
                className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                  selectedHouse === 2
                    ? 'bg-[#C5A059] text-black font-bold shadow'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                House 2 (Suites 07 - 12)
              </button>
            </div>

            {/* Search Input & Occupancy Selector */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search suite name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded bg-white/5 border border-white/10 text-xs font-medium text-white placeholder-white/40 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Occupancy selector */}
              <select
                value={minOccupancy}
                onChange={(e) => setMinOccupancy(Number(e.target.value))}
                className="w-full sm:w-auto px-3 py-2 rounded bg-[#1A1A1A] border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
              >
                <option value={0}>Any Guest Count</option>
                <option value={2}>2+ Guests</option>
                <option value={4}>4+ Guests</option>
              </select>
            </div>
          </div>

          {/* Key Guarantee Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 p-4 rounded-xl bg-[#111111] border border-white/10 text-xs text-white/60">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-[#C5A059] shrink-0" />
              <span>Official Suites: 12 Private Suites (DAR - NDIYA)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-[#C5A059] shrink-0" />
              <span>24/7 Solar Power Backup & AC Guaranteed</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#C5A059] shrink-0" />
              <span>Gated Estate & Private Keycard Access</span>
            </div>
          </div>

          {/* Suites Grid */}
          {filteredSuites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSuites.map((suite) => (
                <SuiteCard key={suite.id} suite={suite} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Suites Match Your Filters"
              description="We could not find any suites matching your specific search query or occupancy requirements. Please try resetting your filter selections."
              actionLabel="Reset All Filters"
              onAction={() => {
                setSelectedHouse('all');
                setSearchQuery('');
                setMinOccupancy(0);
                setSearchParams({});
              }}
            />
          )}
        </Container>
      </Section>
    </>
  );
};
