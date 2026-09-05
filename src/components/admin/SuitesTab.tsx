import React, { useState } from 'react';
import { Suite } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Users,
  Bed,
  Bath,
  Building,
  Image,
  Video,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';

interface SuitesTabProps {
  suites: Suite[];
  onCreateSuite: (data: any) => Promise<void>;
  onUpdateSuite: (id: string, data: any) => Promise<void>;
  onDeleteSuite: (id: string) => Promise<void>;
}

export const SuitesTab: React.FC<SuitesTabProps> = ({
  suites,
  onCreateSuite,
  onUpdateSuite,
  onDeleteSuite,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSuite, setEditingSuite] = useState<Suite | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    houseNumber: 1,
    floor: 'Ground Floor',
    pricePerNight: 150,
    maxOccupancy: 2,
    bedrooms: 1,
    bathrooms: 1,
    description: '',
    images: '',
    videos: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAddModal = () => {
    setEditingSuite(null);
    setFormData({
      name: '',
      houseNumber: 1,
      floor: 'Ground Floor',
      pricePerNight: 150,
      maxOccupancy: 2,
      bedrooms: 1,
      bathrooms: 1,
      description: 'Luxury suite in Kilifa Suites Gambia featuring king bed, pristine parlor, and full luxury amenities.',
      images: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      videos: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (suite: Suite) => {
    setEditingSuite(suite);
    setFormData({
      name: suite.name,
      houseNumber: suite.houseNumber,
      floor: suite.floor,
      pricePerNight: suite.pricePerNight,
      maxOccupancy: suite.maxOccupancy,
      bedrooms: suite.bedrooms,
      bathrooms: suite.bathrooms,
      description: suite.description,
      images: suite.images ? suite.images.join(', ') : '',
      videos: suite.videos ? suite.videos.join(', ') : '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Suite name is required.');
      return;
    }
    if (formData.pricePerNight <= 0) {
      setFormError('Price per night must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        houseNumber: Number(formData.houseNumber),
        floor: formData.floor,
        pricePerNight: Number(formData.pricePerNight),
        maxOccupancy: Number(formData.maxOccupancy),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        description: formData.description.trim(),
        images: formData.images ? formData.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
        videos: formData.videos ? formData.videos.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      if (editingSuite) {
        await onUpdateSuite(editingSuite.id, payload);
      } else {
        await onCreateSuite(payload);
      }

      setIsModalOpen(false);
    } catch (err) {
      setFormError((err as Error).message || 'Failed to save suite.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131A2E] border border-white/10 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-serif text-white font-semibold">Suites, Inventory & Rates</h2>
          <p className="text-xs text-white/50 mt-0.5">
            Manage suite pricing, occupancy rules, descriptions, images, and virtual tours.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-[#C5A059]/20"
        >
          <Plus className="w-4 h-4" /> Add New Luxury Suite
        </button>
      </div>

      {/* Suites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suites.map((suite) => (
          <div
            key={suite.id}
            className="bg-[#131A2E] border border-white/10 rounded-2xl overflow-hidden hover:border-[#C5A059]/40 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Suite Image Preview */}
              <div className="relative h-48 bg-black/40 overflow-hidden">
                <img
                  src={suite.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
                  alt={suite.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-[#C5A059] border border-white/10">
                  House {suite.houseNumber} • {suite.floor}
                </div>
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-[10px] font-mono text-white font-bold">
                  Available
                </div>
              </div>

              {/* Suite Info */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-lg text-white font-bold leading-snug">
                    {suite.name}
                  </h3>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-serif text-[#C5A059] font-bold">
                      ${suite.pricePerNight}
                    </span>
                    <span className="text-[10px] text-white/50 block font-mono">/ night</span>
                  </div>
                </div>

                <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                  {suite.description}
                </p>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/10 text-xs text-white/70">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{suite.maxOccupancy} Guests</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{suite.bedrooms} Bed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{suite.bathrooms} Bath</span>
                  </div>
                </div>

                {/* Media Badges */}
                <div className="flex items-center gap-3 text-[11px] text-white/50 font-mono">
                  <span className="flex items-center gap-1">
                    <Image className="w-3.5 h-3.5 text-[#C5A059]" />
                    {suite.images?.length || 0} Photos
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-[#C5A059]" />
                    {suite.videos?.length || 0} Video Tour
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenEditModal(suite)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#C5A059]" /> Edit Suite
              </button>
              <button
                onClick={() => onDeleteSuite(suite.id)}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                title="Delete Suite"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Suite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#131A2E] border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-serif text-white font-bold">
                {editingSuite ? `Edit Suite: ${editingSuite.name}` : 'Add New Luxury Suite'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 mb-1 font-mono">Suite Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Diplomatic Suite 3"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 mb-1 font-mono">House *</label>
                  <select
                    value={formData.houseNumber}
                    onChange={(e) => setFormData({ ...formData, houseNumber: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value={1} className="bg-[#131A2E]">House 1</option>
                    <option value={2} className="bg-[#131A2E]">House 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-mono">Floor *</label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="Ground Floor" className="bg-[#131A2E]">Ground Floor</option>
                    <option value="First Floor" className="bg-[#131A2E]">First Floor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-mono">Price / Night ($) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-mono">Max Guests *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxOccupancy}
                    onChange={(e) => setFormData({ ...formData, maxOccupancy: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-mono">Bedrooms *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-mono">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed suite description..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-mono">Image URLs (comma separated)</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://image1.jpg, https://image2.jpg"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-mono">Video Tour URLs (comma separated)</label>
                <input
                  type="text"
                  value={formData.videos}
                  onChange={(e) => setFormData({ ...formData, videos: e.target.value })}
                  placeholder="https://video.mp4"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all font-mono flex items-center gap-1.5 shadow-lg shadow-[#C5A059]/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : editingSuite ? 'Update Suite' : 'Create Suite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
