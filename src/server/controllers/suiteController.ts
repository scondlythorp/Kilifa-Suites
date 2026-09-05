import { Request, Response, NextFunction } from 'express';
import { suiteService } from '../services/suiteService';
import { ApiError } from '../middleware/errorHandler';

export const getAllSuites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suites = await suiteService.getAllSuites();
    res.status(200).json({
      status: 'success',
      count: suites.length,
      data: suites,
    });
  } catch (err) {
    next(err);
  }
};

export const getSuiteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const suite = await suiteService.getSuiteById(id);
    res.status(200).json({
      status: 'success',
      data: suite,
    });
  } catch (err) {
    next(err);
  }
};

export const createSuite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, houseNumber, floor, pricePerNight, maxOccupancy, bedrooms, bathrooms, description, slug } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ApiError(400, 'Suite name is required');
    }
    if (!pricePerNight || typeof pricePerNight !== 'number' || pricePerNight <= 0) {
      throw new ApiError(400, 'Valid pricePerNight is required');
    }

    const created = await suiteService.createSuite({
      name: name.trim(),
      houseNumber: Number(houseNumber) || 1,
      floor: floor || 'Ground Floor',
      pricePerNight: Number(pricePerNight),
      maxOccupancy: Number(maxOccupancy) || 2,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      description: description ? String(description).trim() : 'Luxury Gambia Residence',
      slug,
    });

    res.status(201).json({
      status: 'success',
      message: 'Suite created successfully',
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSuite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updated = await suiteService.updateSuite(id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Suite updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSuite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await suiteService.deleteSuite(id);
    res.status(200).json({
      status: 'success',
      message: `Suite '${id}' deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};
