import { MEDIA_GALLERY_DATA } from '../../config/business';
import { prisma } from '../db/prisma';
import { ApiError } from '../middleware/errorHandler';
import { MediaType } from '@prisma/client';

export interface AdminMediaRecord {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'video';
  category: string;
  caption: string;
  alt: string;
  published: boolean;
  createdAt?: string;
}

export interface CreateMediaDTO {
  title: string;
  url: string;
  type: 'image' | 'video';
  category: string;
  caption?: string;
  published?: boolean;
}

export interface UpdateMediaDTO {
  title?: string;
  url?: string;
  type?: 'image' | 'video';
  category?: string;
  caption?: string;
  published?: boolean;
}

class MediaService {
  private fallbackMedia: AdminMediaRecord[] = MEDIA_GALLERY_DATA.map((m) => ({
    id: m.id,
    title: m.caption || 'Kilifa Suites Asset',
    url: m.url,
    type: m.type,
    category: m.category,
    caption: m.caption,
    alt: m.alt,
    published: true,
  }));

  public async getAllMedia(category?: string, type?: string, includeUnpublished = false): Promise<AdminMediaRecord[]> {
    try {
      const items = await prisma.media.findMany({
        orderBy: { createdAt: 'desc' },
      });

      if (items && items.length > 0) {
        let filtered = items;
        if (!includeUnpublished) {
          filtered = filtered.filter((m) => ((m as any).published ?? true));
        }
        if (type && (type === 'image' || type === 'video')) {
          filtered = filtered.filter((m) => m.type.toLowerCase() === type.toLowerCase());
        }
        if (category && category !== 'All') {
          const catLower = category.toLowerCase();
          filtered = filtered.filter((m) => m.category.toLowerCase() === catLower);
        }

        return filtered.map((m) => ({
          id: m.id,
          title: m.title,
          url: m.url,
          type: m.type === MediaType.VIDEO ? 'video' : 'image',
          category: m.category,
          caption: m.caption || m.title,
          alt: m.title,
          published: (m as any).published ?? true,
          createdAt: m.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn('[MEDIA SERVICE] Prisma query failed, using memory fallback:', (err as Error).message);
    }

    let result = this.fallbackMedia;
    if (!includeUnpublished) {
      result = result.filter((m) => m.published);
    }
    if (type && (type === 'image' || type === 'video')) {
      result = result.filter((m) => m.type === type);
    }
    if (category && category !== 'All') {
      const catLower = category.toLowerCase();
      result = result.filter((m) => m.category.toLowerCase() === catLower);
    }

    return result;
  }

  public async createMedia(data: CreateMediaDTO): Promise<AdminMediaRecord> {
    try {
      const created = await prisma.media.create({
        data: {
          title: data.title,
          url: data.url,
          type: data.type === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
          category: data.category,
          caption: data.caption || data.title,
        },
      });

      const record: AdminMediaRecord = {
        id: created.id,
        title: created.title,
        url: created.url,
        type: created.type === MediaType.VIDEO ? 'video' : 'image',
        category: created.category,
        caption: created.caption || created.title,
        alt: created.title,
        published: (created as any).published ?? (data.published ?? true),
        createdAt: created.createdAt.toISOString(),
      };

      this.fallbackMedia.unshift(record);
      return record;
    } catch (err) {
      console.warn('[MEDIA SERVICE] Prisma create media failed, saving to memory fallback:', (err as Error).message);
    }

    const newRecord: AdminMediaRecord = {
      id: `media-${Date.now()}`,
      title: data.title,
      url: data.url,
      type: data.type,
      category: data.category,
      caption: data.caption || data.title,
      alt: data.title,
      published: data.published ?? true,
      createdAt: new Date().toISOString(),
    };

    this.fallbackMedia.unshift(newRecord);
    return newRecord;
  }

  public async updateMedia(id: string, data: UpdateMediaDTO): Promise<AdminMediaRecord> {
    try {
      const existing = await prisma.media.findUnique({ where: { id } });
      if (existing) {
        const updated = await prisma.media.update({
          where: { id },
          data: {
            title: data.title ?? existing.title,
            url: data.url ?? existing.url,
            type: data.type ? (data.type === 'video' ? MediaType.VIDEO : MediaType.IMAGE) : existing.type,
            category: data.category ?? existing.category,
            caption: data.caption ?? existing.caption,
          },
        });

        const record: AdminMediaRecord = {
          id: updated.id,
          title: updated.title,
          url: updated.url,
          type: updated.type === MediaType.VIDEO ? 'video' : 'image',
          category: updated.category,
          caption: updated.caption || updated.title,
          alt: updated.title,
          published: (updated as any).published ?? (data.published ?? true),
          createdAt: updated.createdAt.toISOString(),
        };

        const idx = this.fallbackMedia.findIndex((m) => m.id === id);
        if (idx !== -1) this.fallbackMedia[idx] = record;
        return record;
      }
    } catch (err) {
      console.warn('[MEDIA SERVICE] Prisma update media failed:', (err as Error).message);
    }

    const idx = this.fallbackMedia.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.fallbackMedia[idx] = {
        ...this.fallbackMedia[idx],
        title: data.title ?? this.fallbackMedia[idx].title,
        url: data.url ?? this.fallbackMedia[idx].url,
        type: data.type ?? this.fallbackMedia[idx].type,
        category: data.category ?? this.fallbackMedia[idx].category,
        caption: data.caption ?? this.fallbackMedia[idx].caption,
        published: data.published ?? this.fallbackMedia[idx].published,
      };
      return this.fallbackMedia[idx];
    }

    throw new ApiError(404, `Media item '${id}' not found`);
  }

  public async deleteMedia(id: string): Promise<boolean> {
    try {
      const existing = await prisma.media.findUnique({ where: { id } });
      if (existing) {
        await prisma.media.delete({ where: { id } });
      }
    } catch (err) {
      console.warn('[MEDIA SERVICE] Prisma delete media failed:', (err as Error).message);
    }

    const idx = this.fallbackMedia.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.fallbackMedia.splice(idx, 1);
    }
    return true;
  }

  public async togglePublishStatus(id: string): Promise<AdminMediaRecord> {
    const existing = await this.fallbackMedia.find((m) => m.id === id);
    const newStatus = existing ? !existing.published : false;
    return this.updateMedia(id, { published: newStatus });
  }
}

export const mediaService = new MediaService();
