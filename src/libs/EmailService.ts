import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

export enum EmailTemplate {
  WELCOME = "welcome",
  PASSWORD_RESET = "password-reset",
  ORDER_CONFIRMATION = "order-confirmation",
}

interface SendEmailProps {
  to: string;
  subject: string;
  template: EmailTemplate;
  context: Record<string, any>; // dynamic values injected into template
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  private static getTemplate(templateName: EmailTemplate, context: any) {
    // const filePath = path.join(
    //   process.cwd(),
    //   "mail-templates",
    //   `${templateName}.html`
    // );

    const filePath = path.join(
      __dirname,
      "..",
      "mail-templates",
      `${templateName}.html`
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(`Template not found: ${filePath}`);
    }

    const source = fs.readFileSync(filePath, "utf-8").toString();
    const compiledTemplate = handlebars.compile(source);
    return compiledTemplate(context);
  }

  static async sendMail({ to, subject, template, context }: SendEmailProps) {
    const html = this.getTemplate(template, context);

    return await this.transporter.sendMail({
      from: `"Shopery" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    });
  }
}
