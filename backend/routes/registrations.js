const express = require('express');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRegistration, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/registrations/events/:eventId
// @desc    Register for an event
// @access  Private (Student)
router.post('/events/:eventId', authenticate, authorize('student'), validateObjectId('eventId'), validateRegistration, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user._id;

        // Check if event exists and is available for registration
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.status !== 'approved') {
            return res.status(400).json({ message: 'Event is not available for registration' });
        }

        // Check registration deadline
        if (new Date() > new Date(event.registrationDeadline)) {
            return res.status(400).json({ message: 'Registration deadline has passed' });
        }

        // Check if event has already started
        if (new Date() > new Date(event.date)) {
            return res.status(400).json({ message: 'Event has already started' });
        }

        // Check if user is already registered
        const existingRegistration = await Registration.findOne({
            event: eventId,
            user: userId
        });

        if (existingRegistration) {
            if (existingRegistration.status === 'cancelled') {
                // Reactivate cancelled registration
                existingRegistration.status = 'registered';
                existingRegistration.registrationDate = new Date();
                await existingRegistration.save();

                return res.json({
                    message: 'Registration reactivated successfully',
                    registration: existingRegistration
                });
            } else {
                return res.status(400).json({ 
                    message: `You are already ${existingRegistration.status} for this event` 
                });
            }
        }

        // Check capacity
        const currentRegistrations = await Registration.countDocuments({
            event: eventId,
            status: 'registered'
        });

        let registrationStatus = 'registered';
        if (currentRegistrations >= event.capacity) {
            registrationStatus = 'waitlisted';
        }

        // Create registration
        const registration = new Registration({
            event: eventId,
            user: userId,
            status: registrationStatus,
            additionalInfo: req.body.additionalInfo || {}
        });

        await registration.save();
        await emailService.sendRegistrationConfirmation(req.user, event);
        await registration.populate('event', 'title date time venue');
        await registration.populate('user', 'name email studentId');

        res.status(201).json({
            message: registrationStatus === 'registered' 
                ? 'Registration successful' 
                : 'Added to waitlist - you will be notified if a spot becomes available',
            registration
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   GET /api/registrations
// @desc    Get user's registrations
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = { user: req.user._id };

        // Apply filters
        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.eventCategory) {
            // Need to populate event to filter by category
            const events = await Event.find({ category: req.query.eventCategory }).select('_id');
            query.event = { $in: events.map(e => e._id) };
        }

        const registrations = await Registration.find(query)
            .populate({
                path: 'event',
                populate: {
                    path: 'organizer',
                    select: 'name email'
                }
            })
            .sort('-registrationDate')
            .skip(skip)
            .limit(limit);

        const total = await Registration.countDocuments(query);

        // Get summary statistics
        const stats = await Registration.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusCounts = stats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        res.json({
            registrations,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: registrations.length,
                totalRegistrations: total
            },
            stats: statusCounts
        });
    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({ message: 'Server error fetching registrations' });
    }
});

// @route   GET /api/registrations/:id
// @desc    Get single registration
// @access  Private (Registration owner, event organizer, admin)
router.get('/:id', authenticate, validateObjectId('id'), async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id)
            .populate('event')
            .populate('user', 'name email studentId department phone');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check authorization
        const isOwner = registration.user._id.toString() === req.user._id.toString();
        const isEventOrganizer = registration.event.organizer.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isEventOrganizer && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({ registration });
    } catch (error) {
        console.error('Get registration error:', error);
        res.status(500).json({ message: 'Server error fetching registration' });
    }
});

// @route   PUT /api/registrations/:id
// @desc    Update registration (cancel, update info)
// @access  Private (Registration owner)
router.put('/:id', authenticate, validateObjectId('id'), async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate('event');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check ownership
        if (registration.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { status, additionalInfo, feedback } = req.body;

        // Handle status updates
        if (status) {
            if (status === 'cancelled') {
                // Check if event has started
                if (new Date() > new Date(registration.event.date)) {
                    return res.status(400).json({ message: 'Cannot cancel registration for past events' });
                }

                registration.status = 'cancelled';

                // If this was a registered participant, promote waitlisted user
                if (registration.status === 'registered') {
                    const waitlistedRegistration = await Registration.findOne({
                        event: registration.event._id,
                        status: 'waitlisted'
                    }).sort('registrationDate');

                    if (waitlistedRegistration) {
                        waitlistedRegistration.status = 'registered';
                        await waitlistedRegistration.save();
                    }
                }
            } else if (req.user.role === 'admin') {
                registration.status = status;
            }
        }

        // Update additional info
        if (additionalInfo) {
            registration.additionalInfo = {
                ...registration.additionalInfo,
                ...additionalInfo
            };
        }

        // Update feedback (post-event)
        if (feedback && new Date() > new Date(registration.event.date)) {
            registration.feedback = {
                ...feedback,
                submittedAt: new Date()
            };
        }

        await registration.save();

        res.json({
            message: 'Registration updated successfully',
            registration
        });
    } catch (error) {
        console.error('Update registration error:', error);
        res.status(500).json({ message: 'Server error updating registration' });
    }
});

// @route   DELETE /api/registrations/:id
// @desc    Delete registration (same as cancel)
// @access  Private (Registration owner, admin)
router.delete('/:id', authenticate, validateObjectId('id'), async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate('event');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check ownership
        if (registration.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if event has started
        if (new Date() > new Date(registration.event.date)) {
            return res.status(400).json({ message: 'Cannot delete registration for past events' });
        }

        const wasRegistered = registration.status === 'registered';

        await Registration.findByIdAndDelete(req.params.id);

        // If this was a registered participant, promote waitlisted user
        if (wasRegistered) {
            const waitlistedRegistration = await Registration.findOne({
                event: registration.event._id,
                status: 'waitlisted'
            }).sort('registrationDate');

            if (waitlistedRegistration) {
                waitlistedRegistration.status = 'registered';
                await waitlistedRegistration.save();

                // TODO: Send notification to promoted user
            }
        }

        res.json({ message: 'Registration deleted successfully' });
    } catch (error) {
        console.error('Delete registration error:', error);
        res.status(500).json({ message: 'Server error deleting registration' });
    }
});

// @route   POST /api/registrations/:id/checkin
// @desc    Check in user for event
// @access  Private (Event organizer, admin)
router.post('/:id/checkin', authenticate, validateObjectId('id'), async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate('event');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check authorization
        const isEventOrganizer = registration.event.organizer.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isEventOrganizer && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (registration.status !== 'registered') {
            return res.status(400).json({ message: 'Only registered participants can be checked in' });
        }

        if (registration.checkInTime) {
            return res.status(400).json({ message: 'User already checked in' });
        }

        registration.checkInTime = new Date();
        registration.status = 'attended';
        await registration.save();

        res.json({
            message: 'Check-in successful',
            registration
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ message: 'Server error during check-in' });
    }
});

// @route   GET /api/registrations/events/:eventId/export
// @desc    Export event registrations to CSV
// @access  Private (Event organizer, admin)
router.get('/events/:eventId/export', authenticate, validateObjectId('eventId'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check authorization
        const isEventOrganizer = event.organizer.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isEventOrganizer && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const registrations = await Registration.find({ event: req.params.eventId })
            .populate('user', 'name email studentId department phone')
            .sort('registrationDate');

        // Format data for CSV
        const csvData = registrations.map(reg => ({
            'Name': reg.user.name,
            'Email': reg.user.email,
            'Student ID': reg.user.studentId || '',
            'Department': reg.user.department || '',
            'Phone': reg.user.phone || '',
            'Registration Date': reg.registrationDate.toISOString(),
            'Status': reg.status,
            'Check-in Time': reg.checkInTime ? reg.checkInTime.toISOString() : '',
            'Dietary Restrictions': reg.additionalInfo?.dietaryRestrictions || '',
            'Special Requirements': reg.additionalInfo?.specialRequirements || '',
            'Emergency Contact Name': reg.additionalInfo?.emergencyContact?.name || '',
            'Emergency Contact Phone': reg.additionalInfo?.emergencyContact?.phone || ''
        }));

        res.json({
            event: {
                title: event.title,
                date: event.date
            },
            registrations: csvData,
            totalCount: csvData.length
        });
    } catch (error) {
        console.error('Export registrations error:', error);
        res.status(500).json({ message: 'Server error exporting registrations' });
    }
});

module.exports = router;