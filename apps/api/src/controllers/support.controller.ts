import { NotificationService } from "../services/NotificationService";
import EmailService from "../services/EmailService";
import { ValidationError } from "../utils/errors";

export class SupportController {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    /**
     * Submit a contact inquiry from the support page
     */
    submitInquiry = async (req: any, res: any, next: any) => {
        try {
            const { name, email, topic, message } = req.body || {};

            if (!name || !email || !message) {
                throw new ValidationError("Name, email, and message are required");
            }

            // 1. Send Email to Support
            const supportEmail = process.env.SUPPORT_EMAIL || "support@glotrade.online";
            try {
                await EmailService.sendEmail({
                    to: supportEmail,
                    from: `Glotrade Support <no-reply@glotrade.online>`,
                    subject: `New Support Inquiry: ${topic || 'General'}`,
                    html: `
                        <h3>New Inquiry Received</h3>
                        <p><strong>From:</strong> ${name} (${email})</p>
                        <p><strong>Topic:</strong> ${topic || 'General'}</p>
                        <p><strong>Message:</strong></p>
                        <p style="white-space: pre-wrap; background: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</p>
                    `,
                });
            } catch (emailError) {
                console.error("Failed to send support email:", emailError);
                // Continue with notification even if email fails
            }

            // 2. Create Admin Notification
            try {
                await this.notificationService.sendAdminNotification({
                    type: "support_ticket",
                    title: `New Support Inquiry: ${name}`,
                    message: `${topic}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
                    data: {
                        senderName: name,
                        senderEmail: email,
                        topic
                    }
                });
            } catch (notifError) {
                console.error("Failed to create support notification:", notifError);
            }

            res.status(200).json({
                status: "success",
                message: "Your inquiry has been submitted successfully. Our team will contact you soon."
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new SupportController();
