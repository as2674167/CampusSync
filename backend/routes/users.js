const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { authenticate, authorize } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', authenticate, authorize('admin'), validatePagination, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};

        // Apply filters
        if (req.query.role) {
            query.role = req.query.role;
        }

        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { studentId: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        if (req.query.department) {
            query.department = { $regex: req.query.department, $options: 'i' };
        }

        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: users.length,
                totalUsers: total
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Admin or own profile)
router.get('/:id', authenticate, validateObjectId('id'), async (req, res) => {
    try {
        // Check if user can access this profile
        if (req.user.role !== 'admin' && req.params.id !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user statistics
        let stats = {};

        if (user.role === 'organizer') {
            stats.eventsCreated = await Event.countDocuments({ organizer: user._id });
            stats.approvedEvents = await Event.countDocuments({ 
                organizer: user._id, 
                status: 'approved' 
            });
            stats.pendingEvents = await Event.countDocuments({ 
                organizer: user._id, 
                status: 'pending' 
            });
        }

        if (user.role === 'student') {
            stats.eventsRegistered = await Registration.countDocuments({ 
                user: user._id,
                status: 'registered' 
            });
            stats.eventsAttended = await Registration.countDocuments({ 
                user: user._id,
                status: 'attended' 
            });
        }

        if (user.role === 'admin') {
            stats.totalEvents = await Event.countDocuments();
            stats.totalUsers = await User.countDocuments();
            stats.pendingApprovals = await Event.countDocuments({ status: 'pending' });
        }

        res.json({ user, stats });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error fetching user' });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or own profile)
router.put('/:id', authenticate, validateObjectId('id'), async (req, res) => {
    try {
        // Check if user can update this profile
        if (req.user.role !== 'admin' && req.params.id !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { name, department, phone, avatar } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (department) updateData.department = department;
        if (phone) updateData.phone = phone;
        if (avatar) updateData.avatar = avatar;

        // Only admin can update these fields
        if (req.user.role === 'admin') {
            const { role, isActive, studentId } = req.body;
            if (role) updateData.role = role;
            if (isActive !== undefined) updateData.isActive = isActive;
            if (studentId) updateData.studentId = studentId;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user error:', error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ message: `${field} already exists` });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        res.status(500).json({ message: 'Server error updating user' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete/deactivate user
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('admin'), validateObjectId('id'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Check if user has active registrations or events
        const activeRegistrations = await Registration.countDocuments({
            user: req.params.id,
            status: 'registered'
        });

        const activeEvents = await Event.countDocuments({
            organizer: req.params.id,
            status: { $in: ['approved', 'pending'] },
            date: { $gte: new Date() }
        });

        if (activeRegistrations > 0 || activeEvents > 0) {
            // Deactivate instead of delete
            user.isActive = false;
            await user.save();

            return res.json({
                message: `User deactivated due to ${activeRegistrations} active registrations and ${activeEvents} active events`
            });
        }

        // Soft delete by deactivating
        user.isActive = false;
        await user.save();

        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
});

// @route   GET /api/users/:id/events
// @desc    Get user's events (created or registered)
// @access  Private (Admin, user themselves, or organizer viewing registrations)
router.get('/:id/events', authenticate, validateObjectId('id'), async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && req.params.id !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        let events = [];

        if (targetUser.role === 'organizer' || targetUser.role === 'admin') {
            // Get events created by organizer
            events = await Event.find({ organizer: req.params.id })
                .populate('registrationCount')
                .sort('-createdAt');

            // Add registration count for each event
            for (let event of events) {
                const registrationCount = await Registration.countDocuments({
                    event: event._id,
                    status: 'registered'
                });
                event.registrationCount = registrationCount;
            }
        }

        if (targetUser.role === 'student' || req.query.type === 'registered') {
            // Get events user is registered for
            const registrations = await Registration.find({ 
                user: req.params.id,
                status: { $ne: 'cancelled' }
            })
            .populate({
                path: 'event',
                populate: {
                    path: 'organizer',
                    select: 'name email'
                }
            })
            .sort('-registrationDate');

            const registeredEvents = registrations.map(reg => ({
                ...reg.event.toObject(),
                registration: {
                    status: reg.status,
                    registrationDate: reg.registrationDate,
                    checkInTime: reg.checkInTime,
                    feedback: reg.feedback
                }
            }));

            if (targetUser.role === 'student') {
                events = registeredEvents;
            } else {
                // For organizers/admins, include both created and registered events
                events = {
                    created: events,
                    registered: registeredEvents
                };
            }
        }

        res.json({ events });
    } catch (error) {
        console.error('Get user events error:', error);
        res.status(500).json({ message: 'Server error fetching user events' });
    }
});

// @route   GET /api/users/stats/overview
// @desc    Get system statistics
// @access  Private (Admin only)
router.get('/stats/overview', authenticate, authorize('admin'), async (req, res) => {
    try {
        const [
            totalUsers,
            totalEvents,
            totalRegistrations,
            activeEvents,
            pendingEvents,
            studentsCount,
            organizersCount,
            recentRegistrations
        ] = await Promise.all([
            User.countDocuments({ isActive: true }),
            Event.countDocuments(),
            Registration.countDocuments({ status: 'registered' }),
            Event.countDocuments({ 
                status: 'approved', 
                date: { $gte: new Date() } 
            }),
            Event.countDocuments({ status: 'pending' }),
            User.countDocuments({ role: 'student', isActive: true }),
            User.countDocuments({ role: 'organizer', isActive: true }),
            Registration.countDocuments({
                registrationDate: { 
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                },
                status: 'registered'
            })
        ]);

        // Get popular events
        const popularEvents = await Event.aggregate([
            { $match: { status: 'approved' } },
            {
                $lookup: {
                    from: 'registrations',
                    localField: '_id',
                    foreignField: 'event',
                    as: 'registrations'
                }
            },
            {
                $addFields: {
                    registrationCount: { $size: '$registrations' }
                }
            },
            { $sort: { registrationCount: -1 } },
            { $limit: 5 },
            {
                $project: {
                    title: 1,
                    date: 1,
                    category: 1,
                    registrationCount: 1
                }
            }
        ]);

        res.json({
            overview: {
                totalUsers,
                totalEvents,
                totalRegistrations,
                activeEvents,
                pendingEvents,
                studentsCount,
                organizersCount,
                recentRegistrations
            },
            popularEvents
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error fetching statistics' });
    }
});

module.exports = router;