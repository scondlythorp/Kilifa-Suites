import { prisma } from '../db/prisma';

export interface ContactMessageDTO {
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface ContactRecord extends ContactMessageDTO {
  id: string;
  receivedAt: string;
  status: 'received' | 'processed';
}

class ContactService {
  private fallbackMessages: ContactRecord[] = [];

  public async createContactMessage(data: ContactMessageDTO): Promise<ContactRecord> {
    const id = `cnt-${Date.now()}`;
    const newRecord: ContactRecord = {
      id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || '',
      subject: data.subject || 'General Inquiry',
      message: data.message,
      receivedAt: new Date().toISOString(),
      status: 'received',
    };

    try {
      // Find or create user/notification
      const user = await prisma.user.findFirst({
        where: { email: data.email.toLowerCase() },
      });

      if (user) {
        await prisma.notification.create({
          data: {
            title: `Contact Inquiry: ${data.subject || 'General'}`,
            message: data.message,
            userId: user.id,
          },
        });
      }
    } catch (err) {
      console.warn('[CONTACT SERVICE] Prisma record creation skipped, using in-memory fallback:', (err as Error).message);
    }

    this.fallbackMessages.push(newRecord);
    return newRecord;
  }

  public async getAllMessages(): Promise<ContactRecord[]> {
    return this.fallbackMessages;
  }
}

export const contactService = new ContactService();
