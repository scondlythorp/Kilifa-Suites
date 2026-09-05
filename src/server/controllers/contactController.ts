import { Request, Response, NextFunction } from 'express';
import { contactService } from '../services/contactService';
import { ApiError } from '../middleware/errorHandler';

export const createContactMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    const errors: string[] = [];

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      errors.push('fullName is required');
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push('valid email address is required');
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      errors.push('message is required');
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'Validation Failed', errors);
    }

    const record = await contactService.createContactMessage({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      subject: subject ? String(subject).trim() : 'General Inquiry',
      message: message.trim(),
    });

    res.status(201).json({
      status: 'success',
      message: 'Thank you for contacting Kilifa Suites. Your message has been received.',
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllContactMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await contactService.getAllMessages();
    res.status(200).json({
      status: 'success',
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};
