const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const imagekit = require('../config/imagekit');
const emailService = require('../utils/emailService');
const { authenticate, authorize, authorizeOwnerOrAdmin, optionalAuth } = require('../middleware/auth');
const { validateEvent, validateObjectId, validatePagination } = require('../middleware/validation');
// 👇 ADD THIS IMPORT
const { uploadEventImage, handleUploadError } = require('../middleware/upload');
// 👇 ADD THIS IMPORT
const fs = require('fs');
const path = require('path');

const router = express.Router();

// 👇 ADD THIS HELPER MIDDLEWARE (for parsing FormData fields)
// Parse FormData fields (tags, contactInfo come as JSON strings when using multipart/form-data)
const parseFormDataFields = (req, res, next) => {
    try {
        if (req.body.tags && typeof req.body.tags === 'string') {
            try {
                req.body.tags = JSON.parse(req.body.tags);
            } catch (e) {
                // If not JSON, try comma-separated
                req.body.tags = req.body.tags.split(',').map(t => t.trim()).filter(t => t);
            }
        }
        if (req.body.contactInfo && typeof req.body.contactInfo === 'string') {
            req.body.contactInfo = JSON.parse(req.body.contactInfo);
        }
        if (req.body.capacity) {
            req.body.capacity = parseInt(req.body.capacity);
        }
        next();
    } catch (error) {
        console.error('Parse FormData error:', error);
        return res.status(400).json({ message: 'Invalid form data format' });
    }
};

// @route   GET /api/events
// @desc    Get all approved events (public) or all events for admin
// @access  Public for approved events, Private for all events
router.get('/', optionalAuth, validatePagination, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sort || '-createdAt';

        let query = {};

        // Role-based default filters
        if (!req.user) {
            query.status = 'approved';
        } else if (req.user.role === 'admin') {
            if (req.query.status) {
                query.status = req.query.status;
            }
        } else if (req.user.role === 'organizer') {
            query.organizer = req.user._id;
            if (req.query.status && req.query.status !== 'all') {
                query.status = req.query.status;
            }
        } else {
            query.status = 'approved';
        }

        if (req.query.category) {
            query.category = req.query.category;
        }

        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }
        if (req.query.organizer && req.user && req.user.role === 'admin') {
            query.organizer = req.query.organizer;
        }

        if (req.query.fromDate || req.query.toDate) {
            query.date = {};
            if (req.query.fromDate) {
                query.date.$gte = new Date(req.query.fromDate);
            }
            if (req.query.toDate) {
                query.date.$lte = new Date(req.query.toDate);
            }
        }

        const events = await Event.find(query)
            .populate('organizer', 'name email department')
            .populate('registrationCount')
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .lean();

        for (let event of events) {
            const registrationCount = await Registration.countDocuments({
                event: event._id,
                status: 'registered'
            });
            event.registrationCount = registrationCount;
            event.availableSpots = event.capacity - registrationCount;
            event.registrationStatus = getRegistrationStatus(event, registrationCount);
        }

        const total = await Event.countDocuments(query);

        res.json({
            events,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: events.length,
                totalEvents: total
            }
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Server error fetching events' });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
router.get('/:id', optionalAuth, validateObjectId('id'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email department phone')
            .lean();

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.status !== 'approved' && (!req.user || req.user.role === 'student')) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const registrationCount = await Registration.countDocuments({
            event: event._id,
            status: 'registered'
        });

        event.registrationCount = registrationCount;
        event.availableSpots = event.capacity - registrationCount;
        event.registrationStatus = getRegistrationStatus(event, registrationCount);

        await Event.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

        if (req.user) {
            const userRegistration = await Registration.findOne({
                event: req.params.id,
                user: req.user._id
            });
            event.userRegistration = userRegistration;
        }

        res.json({ event });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ message: 'Server error fetching event' });
    }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Organizer, Admin)
router.post(
  '/',
  authenticate,
  authorize('organizer', 'admin'),
  uploadEventImage.single('image'),
  handleUploadError,
  parseFormDataFields,
  validateEvent,
  async (req, res) => {
    try {
      let imageUrl = null;

      // If an image was uploaded, send it to ImageKit
      if (req.file) {
        const uploadResponse = await imagekit.upload({
          file: req.file.buffer,              // file buffer from multer
          fileName: req.file.originalname,    // original file name
          folder: '/events',                  // folder in ImageKit media library (optional)
        });
        imageUrl = uploadResponse.url;        // CDN URL to store in DB
      }

      const eventData = {
        ...req.body,
        organizer: req.user._id,
        organizerName: req.user.name,
        status: req.user.role === 'admin' ? 'approved' : 'pending',
        image: imageUrl,                      // store ImageKit URL instead of /uploads/...
      };

      const event = new Event(eventData);
      await event.save();

      await event.populate('organizer', 'name email department');

      res.status(201).json({
        message: 'Event created successfully',
        event,
      });
    } catch (error) {
      console.error('Create event error:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          errors: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
        });
      }

      res.status(500).json({ message: 'Server error creating event' });
    }
  }
);
// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Event organizer, Admin)
// 👇 UPDATED ROUTE - Also supports image update
router.put('/:id',
    authenticate,
    validateObjectId('id'),
    uploadEventImage.single('image'),    // 👈 ADDED
    handleUploadError,                    // 👈 ADDED
    parseFormDataFields,                  // 👈 ADDED
    validateEvent,
    async (req, res) => {
        try {
            let event = await Event.findById(req.params.id);

            if (!event) {
                // 👇 Clean up uploaded file if event not found
                if (req.file) {
                    const filePath = path.join(__dirname, '..', 'uploads', 'events', req.file.filename);
                    fs.unlink(filePath, (err) => { if (err) console.error(err); });
                }
                return res.status(404).json({ message: 'Event not found' });
            }

            if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
                // 👇 Clean up uploaded file if unauthorized
                if (req.file) {
                    const filePath = path.join(__dirname, '..', 'uploads', 'events', req.file.filename);
                    fs.unlink(filePath, (err) => { if (err) console.error(err); });
                }
                return res.status(403).json({ message: 'Not authorized to update this event' });
            }

            if (new Date(event.date) < new Date()) {
                if (req.file) {
                    const filePath = path.join(__dirname, '..', 'uploads', 'events', req.file.filename);
                    fs.unlink(filePath, (err) => { if (err) console.error(err); });
                }
                return res.status(400).json({ message: 'Cannot update event that has already started' });
            }

            const updateData = { ...req.body };

            // If a new image is uploaded, send it to ImageKit
            if (req.file) {
             const uploadResponse = await imagekit.upload({
             file: req.file.buffer,
             fileName: req.file.originalname,
             folder: '/events',
             });
             updateData.image = uploadResponse.url;
            }

            if (req.user.role !== 'admin' && event.status === 'approved') {
                updateData.status = 'pending';
            }

            event = await Event.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            ).populate('organizer', 'name email department');

            res.json({
                message: 'Event updated successfully',
                event
            });
        } catch (error) {
            console.error('Update event error:', error);

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    message: 'Validation error',
                    errors: Object.values(error.errors).map(err => ({
                        field: err.path,
                        message: err.message
                    }))
                });
            }
            res.status(500).json({ message: 'Server error updating event' });
        }
    }
);

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Event organizer, Admin)
router.delete('/:id', authenticate, validateObjectId('id'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        const registrationCount = await Registration.countDocuments({
            event: req.params.id,
            status: 'registered'
        });

        if (registrationCount > 0) {
            return res.status(400).json({
                message: `Cannot delete event with ${registrationCount} active registrations. Cancel the event instead.`
            });
        }

        // 👇 ADDED - Delete event image when event is deleted
        if (event.image) {
            const imagePath = path.join(__dirname, '..', event.image);
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Error deleting image:', err);
            });
        }

        await Event.findByIdAndDelete(req.params.id);

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: 'Server error deleting event' });
    }
});

// @route   PUT /api/events/:id/status
// @desc    Update event status (approve/reject)
// @access  Private (Admin only)
router.put('/:id/status', authenticate, authorize('admin'), validateObjectId('id'), async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        if (!['approved', 'rejected', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updateData = { status };
        if (status === 'rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('organizer', 'name email');

        if (status === 'approved') {
        await emailService.sendEventApprovalNotification(event.organizer, event);
        } else if (status === 'rejected') {
        await emailService.sendEventRejectionNotification(event.organizer, event, rejectionReason);
        }

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({
            message: `Event ${status} successfully`,
            event
        });
    } catch (error) {
        console.error('Update event status error:', error);
        res.status(500).json({ message: 'Server error updating event status' });
    }
});

// @route   GET /api/events/:id/registrations
// @desc    Get event registrations
// @access  Private (Event organizer, Admin)
router.get('/:id/registrations', authenticate, validateObjectId('id'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view registrations' });
        }

        const registrations = await Registration.find({ event: req.params.id })
            .populate('user', 'name email studentId department phone')
            .sort('-registrationDate')
            .lean();

        const stats = {
            total: registrations.length,
            registered: registrations.filter(r => r.status === 'registered').length,
            waitlisted: registrations.filter(r => r.status === 'waitlisted').length,
            cancelled: registrations.filter(r => r.status === 'cancelled').length,
            attended: registrations.filter(r => r.status === 'attended').length
        };

        res.json({ registrations, stats });
    } catch (error) {
        console.error('Get event registrations error:', error);
        res.status(500).json({ message: 'Server error fetching registrations' });
    }
});

// Helper function to determine registration status
function getRegistrationStatus(event, registrationCount) {
    const now = new Date();
    if (new Date(event.registrationDeadline) < now) return 'closed';
    if (registrationCount >= event.capacity) return 'full';
    return 'open';
}

module.exports = router;