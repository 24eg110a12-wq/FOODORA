import { Response } from 'express';
import { SupportTicket } from '../models/SupportTicket.js';
import { AuthRequest } from '../middleware/auth.js';

export const getTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const query = user?.role === 'ADMIN' ? {} : { customerId: user?._id };

    const tickets = await SupportTicket.find(query)
      .populate('customerId', 'name email phone')
      .populate('orderId', 'orderNumber priceBreakdown')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, subject, description, orderId } = req.body;
    const count = await SupportTicket.countDocuments();
    const ticketNumber = `TICK-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const ticket = await SupportTicket.create({
      ticketNumber,
      customerId: req.user?._id,
      orderId: orderId || null,
      category: category || 'OTHER',
      subject,
      description,
      status: 'OPEN'
    });

    res.status(201).json({ success: true, message: 'Support ticket submitted successfully', data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, adminResponse } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    if (status) ticket.status = status;
    if (adminResponse) ticket.adminResponse = adminResponse;
    if (req.user?.role === 'ADMIN') ticket.assignedAdminId = req.user._id as any;

    await ticket.save();
    res.json({ success: true, message: 'Ticket updated', data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
