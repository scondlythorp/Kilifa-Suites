import { prisma, isDatabaseConnected } from '../db/prisma';
import { isMemoryFallbackAllowed } from '../config/envConfig';
import { ApiError } from '../middleware/errorHandler';
import { ContactInquiryStatus } from '@prisma/client';

export interface ContactMessageDTO {
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  ipAddress?: string;
}

export interface ContactRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  receivedAt: string;
  status: string;
}

class ContactService {
  private fallbackMessages: ContactRecord[] = [];

  public async createContactMessage(data: ContactMessageDTO): Promise<ContactRecord> {
    if (isDatabaseConnected()) {
      try {
        const created = await prisma.contactInquiry.create({
          data: {
            fullName: data.fullName.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone?.trim() || null,
            subject: (data.subject || 'General Inquiry').trim(),
            message: data.message.trim(),
            ipAddress: data.ipAddress || null,
            status: ContactInquiryStatus.NEW,
          },
        });

        return {
          id: created.id,
          fullName: created.fullName,
          email: created.email,
          phone: created.phone || '',
          subject: created.subject,
          message: created.message,
          receivedAt: created.createdAt.toISOString(),
          status: created.status,
        };
      } catch (err) {
        if (!isMemoryFallbackAllowed()) {
          console.error('[CONTACT SERVICE] Prisma persistence failed and memory fallback is disabled:', (err as Error).message);
          throw new ApiError(503, 'Contact inquiry could not be saved to the database. Please try again shortly.');
        }
        console.warn('[CONTACT SERVICE] Prisma record creation failed, using in-memory fallback:', (err as Error).message);
      }
    }

    const id = `cnt-${Date.now()}`;
    const newRecord: ContactRecord = {
      id,
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || '',
      subject: (data.subject || 'General Inquiry').trim(),
      message: data.message.trim(),
      receivedAt: new Date().toISOString(),
      status: 'NEW',
    };

    this.fallbackMessages.push(newRecord);
    return newRecord;
  }

  public async getAllMessages(): Promise<ContactRecord[]> {
    if (isDatabaseConnected()) {
      try {
        const inquiries = await prisma.contactInquiry.findMany({
          orderBy: { createdAt: 'desc' },
        });

        if (inquiries && inquiries.length > 0) {
          return inquiries.map((inq) => ({
            id: inq.id,
            fullName: inq.fullName,
            email: inq.email,
            phone: inq.phone || '',
            subject: inq.subject,
            message: inq.message,
            receivedAt: inq.createdAt.toISOString(),
            status: inq.status,
          }));
        }
      } catch (err) {
        // Fall back to memory silently
      }
    }

    return this.fallbackMessages;
  }
}

export const contactService = new ContactService();
