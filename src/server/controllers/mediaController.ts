import { Request, Response, NextFunction } from 'express';
import { mediaService } from '../services/mediaService';
import { ApiError } from '../middleware/errorHandler';

export const getAllMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, type, admin } = req.query;
    const includeUnpublished = admin === 'true' || Boolean((req as any).user);

    const items = await mediaService.getAllMedia(
      category ? String(category) : undefined,
      type ? String(type) : undefined,
      includeUnpublished
    );

    res.status(200).json({
      status: 'success',
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

export const createMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, url, type, category, caption, published } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new ApiError(400, 'Media title is required');
    }
    if (!url || typeof url !== 'string' || !url.trim()) {
      throw new ApiError(400, 'Media URL is required');
    }
    if (!type || (type !== 'image' && type !== 'video')) {
      throw new ApiError(400, "Media type must be either 'image' or 'video'");
    }

    const created = await mediaService.createMedia({
      title: title.trim(),
      url: url.trim(),
      type,
      category: category ? String(category).trim() : 'Suites',
      caption: caption ? String(caption).trim() : title.trim(),
      published: published !== false,
    });

    res.status(201).json({
      status: 'success',
      message: 'Media asset added successfully',
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

export const updateMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updated = await mediaService.updateMedia(id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Media asset updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await mediaService.deleteMedia(id);

    res.status(200).json({
      status: 'success',
      message: `Media item '${id}' deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};

export const togglePublishMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updated = await mediaService.togglePublishStatus(id);

    res.status(200).json({
      status: 'success',
      message: `Media item publication status updated to ${updated.published ? 'Published' : 'Unpublished'}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
