import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import sgMail from "@sendgrid/mail";

export enum EmailProvider {
    SMTP = "smtp",
    SES = "ses",
    SENDGRID = "sendgrid",
}

export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    from?: string;
    cta?: {
        label: string;
        url: string;
    };
}

export class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    private sesClient: SESv2Client | null = null;
    private provider: EmailProvider;

    // Brand Colors
    private readonly PRIMARY_BLUE = "#2EA5FF";
    private readonly SECONDARY_ORANGE = "#F9A407";
    private readonly TEXT_DARK = "#1A1A1A";

    constructor() {
        this.provider = (process.env.EMAIL_PROVIDER as EmailProvider) || EmailProvider.SMTP;
        this.initProvider();
    }

    private initProvider() {
        if (this.provider === EmailProvider.SENDGRID) {
            const apiKey = process.env.SENDGRID_API_KEY;
            if (apiKey) {
                sgMail.setApiKey(apiKey);
            } else {
                console.error("[EmailService] SENDGRID_API_KEY is missing");
            }
        }

        if (this.provider === EmailProvider.SES) {
            this.sesClient = new SESv2Client({
                region: process.env.AWS_REGION || "us-east-1",
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
                },
            });
        }

        if (this.provider === EmailProvider.SMTP) {
            const resolvedPort = Number(process.env.SMTP_PORT || 587);
            const resolvedSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || resolvedPort === 465;

            this.transporter = nodemailer.createTransport({
                service: process.env.SMTP_SERVICE || undefined,
                host: process.env.SMTP_HOST,
                port: resolvedPort,
                secure: resolvedSecure,
                requireTLS: String(process.env.SMTP_REQUIRE_TLS || '').toLowerCase() === 'true' || (!resolvedSecure && resolvedPort === 587),
                auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                } : undefined,
                pool: true,
            });
        }
    }

    /**
     * Master Branded HTML Wrapper
     */
    private getBrandedLayout(content: string, subject: string, supportEmail: string, cta?: { label: string, url: string }): string {
        return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: ${this.TEXT_DARK}; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background-color: ${this.PRIMARY_BLUE}; padding: 40px 20px; text-align: center; }
    .logo { color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 1px; text-decoration: none; }
    .content { padding: 40px 30px; }
    .footer { background-color: #f8f9fa; padding: 30px 20px; text-align: center; color: #666666; font-size: 12px; }
    .button { 
        display: inline-block; 
        padding: 14px 30px; 
        background-color: ${this.SECONDARY_ORANGE}; 
        color: #ffffff !important; 
        text-decoration: none; 
        border-radius: 8px; 
        font-weight: bold; 
        margin-top: 25px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .divider { border-top: 1px solid #eeeeee; margin: 30px 0; }
    .social-links { margin: 20px 0; }
    .social-links a { color: ${this.PRIMARY_BLUE}; text-decoration: none; margin: 0 10px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://glotrade.online" class="logo">GLOTRADE</a>
    </div>
    <div class="content">
      <h2 style="color: ${this.PRIMARY_BLUE}; margin-top: 0;">${subject}</h2>
      ${content}
      ${cta ? `<center><a href="${cta.url}" class="button">${cta.label}</a></center>` : ''}
      <div class="divider"></div>
      <p style="font-size: 14px; color: #666;">If you have any questions, reply to this email or contact us at <a href="mailto:${supportEmail}" style="color: ${this.PRIMARY_BLUE}; text-decoration: none;">${supportEmail}</a>.</p>
    </div>
    <div class="footer">
      <div class="social-links">
        <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
      </div>
      <p>&copy; ${new Date().getFullYear()} Glotrade International. All rights reserved.</p>
      <p>Lagos, Nigeria</p>
    </div>
  </div>
</body>
</html>`;
    }

    /**
     * Send an email using the configured provider
     */
    async sendEmail(options: EmailOptions): Promise<void> {
        if (process.env.EMAIL_ENABLED === 'false') {
            console.log(`[EmailService] Skipping email to ${options.to} (EMAIL_ENABLED=false)`);
            return;
        }

        const from = options.from || process.env.SMTP_FROM || "no-reply@glotrade.online";
        const supportEmail = process.env.SUPPORT_EMAIL || "support@glotrade.online";

        // Wrap content in branded layout if html is provided
        const finalHtml = options.html ? this.getBrandedLayout(options.html, options.subject, supportEmail, options.cta) : undefined;

        console.log(`[EmailService] Sending via ${this.provider} to ${options.to} (Subject: ${options.subject})`);

        try {
            if (this.provider === EmailProvider.SENDGRID) {
                await this.sendViaSendGrid(from, { ...options, html: finalHtml });
            } else if (this.provider === EmailProvider.SES && this.sesClient) {
                await this.sendViaSES(from, { ...options, html: finalHtml });
            } else if (this.transporter) {
                await this.sendViaSMTP(from, { ...options, html: finalHtml });
            } else {
                console.warn("[EmailService] No email provider initialized. Falling back to Ethereal in non-production.");
                if (process.env.NODE_ENV !== "production") {
                    await this.sendViaEthereal({ ...options, html: finalHtml });
                }
            }
        } catch (error) {
            console.error(`[EmailService] Error sending email via ${this.provider}:`, error);
            throw error;
        }
    }

    private async sendViaSendGrid(from: string, options: EmailOptions): Promise<void> {
        await sgMail.send({
            to: options.to,
            from,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
    }

    private async sendViaSMTP(from: string, options: EmailOptions): Promise<void> {
        if (!this.transporter) return;
        await this.transporter.sendMail({
            from,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
    }

    private async sendViaSES(from: string, options: EmailOptions): Promise<void> {
        if (!this.sesClient) return;

        const command = new SendEmailCommand({
            FromEmailAddress: from,
            Destination: {
                ToAddresses: [options.to],
            },
            Content: {
                Simple: {
                    Subject: { Data: options.subject },
                    Body: {
                        Html: options.html ? { Data: options.html } : undefined,
                        Text: options.text ? { Data: options.text } : undefined,
                    },
                },
            },
        });

        await this.sesClient.send(command);
    }

    private async sendViaEthereal(options: EmailOptions): Promise<void> {
        try {
            const testAccount = await nodemailer.createTestAccount();
            const etherealTransporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: { user: testAccount.user, pass: testAccount.pass },
            });
            const info = await etherealTransporter.sendMail({
                from: 'Glotrade Test <no-reply@ethereal.email>',
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });
            const preview = nodemailer.getTestMessageUrl(info);
            if (preview) console.log('Ethereal preview URL:', preview);
        } catch (e) {
            console.warn('Ethereal fallback failed', e);
        }
    }

    /**
     * Shorthand for verification email
     */
    async sendVerificationEmail(email: string, url: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: "Verify your email",
            text: `Welcome to Glotrade! Please verify your account using this link: ${url}`,
            html: `<p>Welcome to <strong>Glotrade</strong>!</p><p>We're excited to have you on board. To get started and secure your account, please verify your email address.</p>`,
            cta: {
                label: "Verify My Account",
                url: url
            }
        });
    }

    /**
     * Shorthand for password reset email
     */
    async sendPasswordResetEmail(email: string, url: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: "Reset your password",
            text: `You requested a password reset. Use this link to proceed: ${url}`,
            html: `<p>We received a request to reset the password for your Glotrade account.</p><p>If you didn't make this request, you can safely ignore this email.</p>`,
            cta: {
                label: "Reset Password",
                url: url
            }
        });
    }

    /**
     * Shorthand for reactivation email
     */
    async sendReactivationEmail(email: string, url: string, deletionCount: number): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: "Account Reactivation Required",
            text: `Your account was marked for deletion. Click here to reactivate: ${url}`,
            html: `
        <p>Your Glotrade account was recently marked for deletion and requires reactivation to stay active.</p>
        <p>This is deletion attempt <strong>#${deletionCount}</strong>.</p>
        <p>Click the button below to reactivate your account immediately. This link expires in 24 hours.</p>
      `,
            cta: {
                label: "Reactivate My Account",
                url: url
            }
        });
    }
}

export default new EmailService();
