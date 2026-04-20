const nodemailer = require('nodemailer');
const transporter = nodemailer.default || nodemailer;

class EmailService {
    constructor() {
        this.transporter = transporter.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendEmail(to, subject, html, text = null) {
        try {
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.log('Email credentials not configured, skipping email send');
                return { success: false, message: 'Email not configured' };
            }

            const mailOptions = {
                from: `"College Event Management" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }
    }

    async sendEventApprovalNotification(organizer, event) {
        const subject = `Event Approved: ${event.title}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Event Approved! 🎉</h2>
                <p>Hi ${organizer.name},</p>
                <p>Great news! Your event has been approved and is now live for registrations.</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">${event.title}</h3>
                    <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Venue:</strong> ${event.venue}</p>
                    <p><strong>Capacity:</strong> ${event.capacity} participants</p>
                </div>

                <p>Students can now register for your event. You can monitor registrations through your organizer dashboard.</p>

                <p style="margin-top: 30px;">
                    Best regards,<br>
                    College Event Management Team
                </p>
            </div>
        `;

        return await this.sendEmail(organizer.email, subject, html);
    }

    async sendEventRejectionNotification(organizer, event, reason = '') {
        const subject = `Event Update Required: ${event.title}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #e74c3c;">Event Needs Updates</h2>
                <p>Hi ${organizer.name},</p>
                <p>Your event submission requires some updates before it can be approved.</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">${event.title}</h3>
                    <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                    <p><strong>Venue:</strong> ${event.venue}</p>
                </div>

                ${reason ? `
                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
                    </div>
                ` : ''}

                <p>Please review and update your event details, then resubmit for approval.</p>

                <p style="margin-top: 30px;">
                    Best regards,<br>
                    College Event Management Team
                </p>
            </div>
        `;

        return await this.sendEmail(organizer.email, subject, html);
    }

    async sendRegistrationConfirmation(user, event) {
        const subject = `Registration Confirmed: ${event.title}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #28a745;">Registration Successful! ✅</h2>
                <p>Hi ${user.name},</p>
                <p>You have successfully registered for the following event:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">${event.title}</h3>
                    <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Venue:</strong> ${event.venue}</p>
                    <p><strong>Category:</strong> ${event.category}</p>
                </div>

                <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                    <p style="margin: 0;"><strong>Important:</strong> Please save this confirmation for your records. You may need to show it during check-in.</p>
                </div>

                <p>We're excited to see you at the event!</p>

                <p style="margin-top: 30px;">
                    Best regards,<br>
                    College Event Management Team
                </p>
            </div>
        `;

        return await this.sendEmail(user.email, subject, html);
    }

    async sendWaitlistNotification(user, event) {
        const subject = `Added to Waitlist: ${event.title}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ffc107;">You're on the Waitlist</h2>
                <p>Hi ${user.name},</p>
                <p>The event you tried to register for is currently full, but we've added you to the waitlist:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">${event.title}</h3>
                    <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Venue:</strong> ${event.venue}</p>
                </div>

                <p>If a spot becomes available, we'll automatically register you and send you a confirmation email.</p>

                <p style="margin-top: 30px;">
                    Best regards,<br>
                    College Event Management Team
                </p>
            </div>
        `;

        return await this.sendEmail(user.email, subject, html);
    }

    async sendEventReminder(user, event) {
        const eventDate = new Date(event.date);
        const subject = `Event Reminder: ${event.title} - Tomorrow`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Event Reminder 📅</h2>
                <p>Hi ${user.name},</p>
                <p>This is a friendly reminder that you're registered for an event tomorrow:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">${event.title}</h3>
                    <p><strong>Date:</strong> ${eventDate.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Venue:</strong> ${event.venue}</p>
                </div>

                <div style="background-color: #cce5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Tips for the event:</strong></p>
                    <ul style="margin: 10px 0;">
                        <li>Arrive 15 minutes early</li>
                        <li>Bring your student ID</li>
                        <li>Check for any last-minute updates</li>
                    </ul>
                </div>

                <p>Looking forward to seeing you there!</p>

                <p style="margin-top: 30px;">
                    Best regards,<br>
                    College Event Management Team
                </p>
            </div>
        `;

        return await this.sendEmail(user.email, subject, html);
    }
}

module.exports = new EmailService();