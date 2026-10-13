import { SUITES_DATA } from '../../config/business';
import { Suite } from '../../types';
import { ApiError } from '../middleware/errorHandler';
import { prisma, isDatabaseConnected } from '../db/prisma';

export interface CreateSuiteDTO {
  name: string;
  slug?: string;
  houseNumber: number;
  floor: string;
  pricePerNight: number;
  maxOccupancy: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  images?: string[];
  videos?: string[];
}

export interface UpdateSuiteDTO {
  name?: string;
  houseNumber?: number;
  floor?: string;
  pricePerNight?: number;
  maxOccupancy?: number;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  images?: string[];
  videos?: string[];
}

class SuiteService {
  private fallbackSuites: Suite[] = [...SUITES_DATA];

  public async getAllSuites(): Promise<Suite[]> {
    if (isDatabaseConnected()) {
      try {
        const suites = await prisma.suite.findMany({
          include: {
            house: true,
            amenities: true,
          },
          orderBy: { slug: 'asc' },
        });

        if (suites && suites.length > 0) {
          return suites.map((s) => {
            const fallback = this.fallbackSuites.find((f) => f.slug === s.slug || f.id === s.id) || this.fallbackSuites[0];
            return {
              ...fallback,
              id: s.id,
              slug: s.slug,
              name: s.name,
              houseNumber: s.houseNumber as 1 | 2,
              pricePerNight: s.pricePerNight,
              maxOccupancy: s.maxOccupancy,
              bedrooms: s.bedrooms,
              bathrooms: s.bathrooms,
              description: s.description,
              floor: s.floor === 'Ground' ? 'Ground Floor' : (s.floor === 'Upper' ? 'First Floor' : s.floor as any),
            };
          });
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }

    return this.fallbackSuites;
  }

  public async getSuiteById(id: string): Promise<Suite> {
    if (isDatabaseConnected()) {
      try {
        const suite = await prisma.suite.findFirst({
          where: {
            OR: [
              { id },
              { slug: id },
              { id: `suite-${id}` },
            ],
          },
          include: {
            house: true,
            amenities: true,
          },
        });

        if (suite) {
          const fallback = this.fallbackSuites.find((f) => f.slug === suite.slug || f.id === suite.id) || this.fallbackSuites[0];
          return {
            ...fallback,
            id: suite.id,
            slug: suite.slug,
            name: suite.name,
            houseNumber: suite.houseNumber as 1 | 2,
            pricePerNight: suite.pricePerNight,
            maxOccupancy: suite.maxOccupancy,
            bedrooms: suite.bedrooms,
            bathrooms: suite.bathrooms,
            description: suite.description,
            floor: suite.floor === 'Ground' ? 'Ground Floor' : (suite.floor === 'Upper' ? 'First Floor' : suite.floor as any),
          };
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }

    const fallbackSuite = this.fallbackSuites.find(
      (s) => s.id === id || s.slug === id || s.id === `suite-${id}`
    );

    if (!fallbackSuite) {
      throw new ApiError(404, `Suite with ID or slug '${id}' not found`);
    }

    return fallbackSuite;
  }

  public async createSuite(data: CreateSuiteDTO): Promise<Suite> {
    const slug = data.slug || `suite-${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    try {
      let house = await prisma.house.findFirst({ where: { houseNumber: data.houseNumber } });
      if (!house) {
        house = await prisma.house.findFirst();
      }

      const created = await prisma.suite.create({
        data: {
          slug,
          name: data.name,
          houseNumber: data.houseNumber,
          floor: data.floor.includes('Ground') ? 'Ground' : 'Upper',
          pricePerNight: data.pricePerNight,
          maxOccupancy: data.maxOccupancy,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          description: data.description,
          parlor: true,
          houseId: house?.id,
        },
      });

      const fallback = this.fallbackSuites[0];
      const newSuite: Suite = {
        ...fallback,
        id: created.id,
        slug: created.slug,
        name: created.name,
        houseNumber: created.houseNumber as 1 | 2,
        pricePerNight: created.pricePerNight,
        maxOccupancy: created.maxOccupancy,
        bedrooms: created.bedrooms,
        bathrooms: created.bathrooms,
        description: created.description,
        floor: created.floor === 'Ground' ? 'Ground Floor' : 'First Floor',
      };

      this.fallbackSuites.push(newSuite);
      return newSuite;
    } catch (err) {
      console.warn('[SUITE SERVICE] Prisma create failed, adding to memory fallback:', (err as Error).message);
      const fallback = this.fallbackSuites[0];
      const newSuite: Suite = {
        ...fallback,
        id: `suite-${Date.now()}`,
        slug,
        name: data.name,
        houseNumber: (data.houseNumber || 1) as 1 | 2,
        pricePerNight: data.pricePerNight,
        maxOccupancy: data.maxOccupancy,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        description: data.description,
        floor: data.floor as any,
      };
      this.fallbackSuites.push(newSuite);
      return newSuite;
    }
  }

  public async updateSuite(id: string, data: UpdateSuiteDTO): Promise<Suite> {
    try {
      const existing = await prisma.suite.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });

      if (existing) {
        const updated = await prisma.suite.update({
          where: { id: existing.id },
          data: {
            name: data.name ?? existing.name,
            houseNumber: data.houseNumber ?? existing.houseNumber,
            floor: data.floor ? (data.floor.includes('Ground') ? 'Ground' : 'Upper') : existing.floor,
            pricePerNight: data.pricePerNight ?? existing.pricePerNight,
            maxOccupancy: data.maxOccupancy ?? existing.maxOccupancy,
            bedrooms: data.bedrooms ?? existing.bedrooms,
            bathrooms: data.bathrooms ?? existing.bathrooms,
            description: data.description ?? existing.description,
          },
        });

        const fallback = this.fallbackSuites.find((f) => f.slug === updated.slug || f.id === updated.id) || this.fallbackSuites[0];
        const resSuite: Suite = {
          ...fallback,
          id: updated.id,
          slug: updated.slug,
          name: updated.name,
          houseNumber: updated.houseNumber as 1 | 2,
          pricePerNight: updated.pricePerNight,
          maxOccupancy: updated.maxOccupancy,
          bedrooms: updated.bedrooms,
          bathrooms: updated.bathrooms,
          description: updated.description,
          floor: updated.floor === 'Ground' ? 'Ground Floor' : 'First Floor',
        };

        // Update in-memory fallback list
        const idx = this.fallbackSuites.findIndex((s) => s.id === id || s.slug === id);
        if (idx !== -1) {
          this.fallbackSuites[idx] = resSuite;
        }

        return resSuite;
      }
    } catch (err) {
      console.warn('[SUITE SERVICE] Prisma update failed, updating memory fallback:', (err as Error).message);
    }

    const idx = this.fallbackSuites.findIndex((s) => s.id === id || s.slug === id);
    if (idx !== -1) {
      this.fallbackSuites[idx] = {
        ...this.fallbackSuites[idx],
        name: data.name ?? this.fallbackSuites[idx].name,
        pricePerNight: data.pricePerNight ?? this.fallbackSuites[idx].pricePerNight,
        maxOccupancy: data.maxOccupancy ?? this.fallbackSuites[idx].maxOccupancy,
        bedrooms: data.bedrooms ?? this.fallbackSuites[idx].bedrooms,
        bathrooms: data.bathrooms ?? this.fallbackSuites[idx].bathrooms,
        description: data.description ?? this.fallbackSuites[idx].description,
      };
      return this.fallbackSuites[idx];
    }

    throw new ApiError(404, `Suite with ID '${id}' not found`);
  }

  public async deleteSuite(id: string): Promise<boolean> {
    try {
      const existing = await prisma.suite.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });
      if (existing) {
        await prisma.suite.delete({ where: { id: existing.id } });
      }
    } catch (err) {
      console.warn('[SUITE SERVICE] Prisma delete failed:', (err as Error).message);
    }

    const idx = this.fallbackSuites.findIndex((s) => s.id === id || s.slug === id);
    if (idx !== -1) {
      this.fallbackSuites.splice(idx, 1);
    }
    return true;
  }
}

export const suiteService = new SuiteService();
