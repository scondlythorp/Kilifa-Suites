import React, { useState } from 'react';
import {
  Image,
  Video,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  CheckCircle,
  X,
  AlertCircle,
  Tag,
  Link,
} from 'lucide-react';

interface MediaTabProps {
  mediaList: any[];
  onCreateMedia: (data: any) => Promise<void>;
  onUpdateMedia: (id: string, data: any) => Promise<void>;
  onDeleteMedia: (id: string) => Promise<void>;
  onTogglePublish: (id: string) => Promise<void>;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  mediaList,
  onCreateMedia,
  onUpdateMedia,
  onDeleteMedia,
  onTogglePublish,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMedia, setEditingMedia] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'image',
    category: 'Suites',
    caption: '',
    published: true,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const categories = ['All', 'Suites', 'Houses', 'Pool', 'Lounge', 'Gardens', 'Security', 'Aerial'];

  const filteredMedia = mediaList.filter((m) => {
    if (selectedCategory === 'All') return true;
    return m.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleOpenAdd = () => {
    setEditingMedia(null);
    setFormData({
      title: '',
      url: '',
      type: 'image',
      category: 'Suites',
      caption: '',
      published: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: any) => {
    setEditingMedia(m);
    setFormData({
      title: m.title,
      url: m.url,
      type: m.type,
      category: m.category,
      caption: m.caption || m.title,
      published: m.published !== false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) {
      setFormError('Title and Asset URL are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingMedia) {
        await onUpdateMedia(editingMedia.id, formData);
      } else {
        await onCreateMedia(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError((err as Error).message || 'Failed to save media.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Category Filter Bar */}
      <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif text-white font-semibold">Media & Asset Library</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Upload luxury imagery, video tours, categorize gallery assets, and publish/unpublish items.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-[#C5A059]/20"
          >
            <Plus className="w-4 h-4" /> Add Media Asset
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none border-t border-white/10">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#C5A059] text-black font-semibold shadow-md shadow-[#C5A059]/20'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className="bg-[#131A2E] border border-white/10 rounded-2xl overflow-hidden hover:border-[#C5A059]/40 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image / Video Thumbnail */}
              <div className="relative h-44 bg-black/60 overflow-hidden">
                {item.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-[#C5A059]">
                    <Video className="w-10 h-10" />
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Status Badge */}
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono text-[#C5A059] border border-white/10 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{item.category}</span>
                </div>

                <button
                  onClick={() => onTogglePublish(item.id)}
                  className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border transition-all ${
                    item.published
                      ? 'bg-emerald-500/80 text-white border-emerald-400'
                      : 'bg-amber-500/80 text-black border-amber-400'
                  }`}
                  title="Click to toggle publication status"
                >
                  {item.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{item.published ? 'Published' : 'Hidden'}</span>
                </button>
              </div>

              <div className="p-4 space-y-1">
                <h4 className="font-serif font-bold text-white text-sm truncate">{item.title}</h4>
                <p className="text-xs text-white/50 line-clamp-2">{item.caption || item.title}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 border-t border-white/10 bg-black/20 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenEdit(item)}
                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 transition-all flex items-center justify-center gap-1"
              >
                <Edit2 className="w-3 h-3 text-[#C5A059]" /> Edit
              </button>
              <button
                onClick={() => onDeleteMedia(item.id)}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                title="Delete Media Asset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Media Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#131A2E] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-serif text-white font-bold">
                {editingMedia ? 'Edit Media Asset' : 'Add New Media Asset'}
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
                <label className="block text-white/70 mb-1 font-mono">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Royal Diplomatic Suite Master Bed"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-mono">Asset URL (Image/Video) *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-mono">Media Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="image" className="bg-[#131A2E]">Image</option>
                    <option value="video" className="bg-[#131A2E]">Video Tour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-mono">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#C5A059] focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c} className="bg-[#131A2E]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-mono">Caption</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Descriptive caption for gallery lightbox..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="published-check"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded border-white/20 bg-black/40 text-[#C5A059] focus:ring-0"
                />
                <label htmlFor="published-check" className="text-white/80 font-mono">
                  Publish to Public Guest Gallery
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white border border-white/10 transition-all font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all font-mono flex items-center gap-1.5 shadow-lg shadow-[#C5A059]/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : editingMedia ? 'Update Media' : 'Save Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
