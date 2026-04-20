const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    date: {
        type: Date,
        required: [true, 'Event date is required'],
        validate: {
            validator: function(date) {
                return date > new Date();
            },
            message: 'Event date must be in the future'
        }
    },
    time: {
        type: String,
        required: [true, 'Event time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    venue: {
        type: String,
        required: [true, 'Event venue is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Event category is required'],
        enum: ['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'Seminar', 'Competition']
    },
    capacity: {
        type: Number,
        required: [true, 'Event capacity is required'],
        min: [1, 'Capacity must be at least 1'],
        max: [10000, 'Capacity cannot exceed 10000']
    },
    image: {
       type: String,
       default: null
   },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizerName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
        default: 'pending' 
    },
    rejectionReason: {
                 type: String,
                default: '',
                maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    },
    registrationDeadline: {
        type: Date,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    requirements: {
        type: String,
        maxlength: [500, 'Requirements cannot exceed 500 characters']
    },
    contactInfo: {
        email: {
            type: String,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
        },
        phone: {
            type: String,
            match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
        }
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for better query performance
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ title: 'text', description: 'text' });

// Virtual for current registration count
eventSchema.virtual('registrationCount', {
    ref: 'Registration',
    localField: '_id',
    foreignField: 'event',
    count: true
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
    return this.capacity - (this.registrationCount || 0);
});

// Virtual for registration status
eventSchema.virtual('registrationStatus').get(function() {
    const now = new Date();
    if (this.registrationDeadline < now) return 'closed';
    if (this.availableSpots <= 0) return 'full';
    return 'open';
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);