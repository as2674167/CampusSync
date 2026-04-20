const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

// User validation rules
const validateUserRegistration = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
        .optional()
        .isIn(['student', 'organizer', 'admin'])
        .withMessage('Role must be student, organizer, or admin'),
    body('studentId')
        .optional()
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage('Student ID must be between 5 and 20 characters'),
    body('department')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Department name cannot exceed 50 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    handleValidationErrors
];

const validateUserLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Event validation rules
const validateEvent = [
    body('title')
        .notEmpty()
        .withMessage('Event title is required')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),
    body('description')
        .notEmpty()
        .withMessage('Event description is required')
        .trim()
        .isLength({ min: 20, max: 1000 })
        .withMessage('Description must be between 20 and 1000 characters'),
    body('date')
        .isISO8601()
        .withMessage('Please provide a valid date in ISO format')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Event date must be in the future');
            }
            return true;
        }),
    body('time')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Please provide time in HH:MM format'),
    body('venue')
        .notEmpty()
        .withMessage('Event venue is required')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Venue must be between 3 and 100 characters'),
    body('category')
        .isIn(['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'Seminar', 'Competition'])
        .withMessage('Please select a valid category'),
    body('capacity')
        .isInt({ min: 1, max: 10000 })
        .withMessage('Capacity must be between 1 and 10000'),
    body('registrationDeadline')
        .isISO8601()
        .withMessage('Please provide a valid registration deadline')
        .custom((value, { req }) => {
            const deadline = new Date(value);
            const eventDate = new Date(req.body.date);
            if (deadline >= eventDate) {
                throw new Error('Registration deadline must be before event date');
            }
            if (deadline <= new Date()) {
                throw new Error('Registration deadline must be in the future');
            }
            return true;
        }),
    body('requirements')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Requirements cannot exceed 500 characters'),
    // Updated to handle FormData (strings)
    body('contactInfo')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    if (parsed.email && !/\S+@\S+\.\S+/.test(parsed.email)) {
                        throw new Error('Please provide a valid contact email');
                    }
                    return true;
                } catch (e) {
                    throw new Error('Invalid contactInfo format');
                }
            }
            return true;
        }),
    body('tags')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed)) {
                        throw new Error('Tags must be an array');
                    }
                    return true;
                } catch (e) {
                    throw new Error('Invalid tags format');
                }
            }
            if (Array.isArray(value)) return true;
            throw new Error('Tags must be an array');
        }),
    handleValidationErrors
];

// Registration validation rules
const validateRegistration = [
    body('additionalInfo.dietaryRestrictions')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Dietary restrictions cannot exceed 200 characters'),
    body('additionalInfo.specialRequirements')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Special requirements cannot exceed 200 characters'),
    body('additionalInfo.emergencyContact.name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Emergency contact name must be between 2 and 50 characters'),
    body('additionalInfo.emergencyContact.phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid emergency contact phone number'),
    handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName} format`),
    handleValidationErrors
];

// Query validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('sort')
        .optional()
        .isIn(['date', '-date', 'title', '-title', 'createdAt', '-createdAt', 'registrationCount', '-registrationCount'])
        .withMessage('Invalid sort parameter'),
    handleValidationErrors
];

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateEvent,
    validateRegistration,
    validateObjectId,
    validatePagination,
    handleValidationErrors
};