import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService';

export const getAnalyticsReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const timeframe = (req.query.timeframe as '30d' | '90d' | 'year' | 'all') || 'all';
    const report = await analyticsService.getAnalyticsReport(timeframe);
    res.status(200).json({
      status: 'success',
      timeframe,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};
