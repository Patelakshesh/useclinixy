import { Request, Response, NextFunction } from 'express';
import Feedback from '../models/feedback.model';
import Clinic from '../models/clinic.model';
import { logAudit } from '../utils/auditLog.util';

export const submitFeedback = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rating, category, message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Feedback message is required' });
      return;
    }

    const numRating = Number(rating) || 5;
    if (numRating < 1 || numRating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      return;
    }

    const validCategories = ['FEATURE_REQUEST', 'IMPROVEMENT', 'BUG', 'GENERAL'];
    const feedbackCategory = validCategories.includes(category) ? category : 'IMPROVEMENT';

    let clinicName = '';
    if (req.user?.clinicId) {
      const clinic = await Clinic.findById(req.user.clinicId).select('name').lean();
      if (clinic) clinicName = clinic.name;
    }

    const feedback = await Feedback.create({
      clinicId: req.user?.clinicId || null,
      clinicName,
      userId: req.user?.id || req.user?._id,
      userName: req.user?.name || 'Clinic User',
      userEmail: req.user?.email || '',
      userRole: req.user?.role || 'CLINIC_ADMIN',
      rating: numRating,
      category: feedbackCategory,
      message: message.trim(),
      status: 'NEW',
    });

    if (req.user?.id) {
      await logAudit(
        req.user.id || req.user._id,
        'SUBMIT_FEEDBACK',
        { feedbackId: feedback._id, category: feedbackCategory, rating: numRating },
        req.user.clinicId,
        req.ip
      );
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Our team reads every submission to improve Clinixy.',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminFeedbacks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.status && req.query.status !== 'ALL') {
      query.status = req.query.status;
    }
    if (req.query.category && req.query.category !== 'ALL') {
      query.category = req.query.category;
    }
    if (req.query.rating) {
      query.rating = Number(req.query.rating);
    }
    if (req.query.search) {
      const search = (req.query.search as string).trim();
      query.$or = [
        { clinicName: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const [feedbacks, total, totalCount, newCount, featureRequestsCount, ratings] = await Promise.all([
      Feedback.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('clinicId', 'name mobileNumber phone address status')
        .lean(),
      Feedback.countDocuments(query),
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'NEW' }),
      Feedback.countDocuments({ category: 'FEATURE_REQUEST' }),
      Feedback.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    const avgRating = ratings.length > 0 && ratings[0].avgRating ? Number(ratings[0].avgRating.toFixed(1)) : 5.0;

    res.status(200).json({
      success: true,
      data: {
        feedbacks,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        kpis: {
          totalCount,
          newCount,
          featureRequestsCount,
          avgRating
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateFeedbackStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const feedback = await Feedback.findByIdAndUpdate(id, updateData, { new: true });
    if (!feedback) {
      res.status(404).json({ success: false, message: 'Feedback not found' });
      return;
    }

    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

export const deleteFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) {
      res.status(404).json({ success: false, message: 'Feedback not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Feedback removed' });
  } catch (error) {
    next(error);
  }
};
