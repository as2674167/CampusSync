const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['registered', 'waitlisted', 'cancelled', 'attended', 'no-show'],
        default: 'registered'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    additionalInfo: {
        dietaryRestrictions: String,
        specialRequirements: String,
        emergencyContact: {
            name: String,
            phone: String
        }
    },
    checkInTime: {
        type: Date
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: [500, 'Feedback comment cannot exceed 500 characters']
        },
        submittedAt: Date
    }
}, {
    timestamps: true
});

// Compound index to ensure one registration per user per event
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

// Index for queries
registrationSchema.index({ status: 1 });
registrationSchema.index({ registrationDate: -1 });

module.exports = mongoose.model('Registration', registrationSchema);