import React from 'react';
import { Media } from '../../types';
import { ImagePlaceholder } from '../common/ImagePlaceholder';
import { VideoPlaceholder } from '../common/VideoPlaceholder';

interface MediaCardProps {
  media: Media;
  onOpenLightbox?: (media: Media) => void;
  onOpenVideo?: (media: Media) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onOpenLightbox,
  onOpenVideo,
}) => {
  if (media.type === 'video') {
    return (
      <div className="flex flex-col h-full">
        <VideoPlaceholder
          title={media.caption}
          duration={media.duration}
          thumbnail={media.thumbnail}
          onPlayClick={() => onOpenVideo && onOpenVideo(media)}
        />
        <div className="mt-3">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-[#C5A059] uppercase">
            {media.category} Video
          </span>
          <p className="text-sm font-medium text-white/90 mt-1 font-serif italic">
            {media.caption}
          </p>
        </div>
      </div>
    );
  }

  const hasRealUrl = media.url && !media.url.startsWith('[') && !media.url.includes('placeholder');

  return (
    <div
      onClick={() => onOpenLightbox && onOpenLightbox(media)}
      className="flex flex-col h-full cursor-pointer group"
    >
      <div className="overflow-hidden rounded-xl border border-white/10 shadow-sm group-hover:border-[#C5A059]/50 transition-all aspect-video relative bg-[#161616]">
        {hasRealUrl ? (
          <>
            <img
              src={media.url}
              alt={media.alt || media.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        ) : (
          <ImagePlaceholder
            title={media.caption}
            subtitle={`Kilifa Suites • ${media.category.toUpperCase()}`}
            aspectRatio="video"
          />
        )}
      </div>
      <div className="mt-3">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-[#C5A059] uppercase">
          {media.category}
        </span>
        <p className="text-sm font-medium text-white/90 group-hover:text-[#C5A059] transition-colors mt-1 font-serif italic">
          {media.caption}
        </p>
      </div>
    </div>
  );
};
