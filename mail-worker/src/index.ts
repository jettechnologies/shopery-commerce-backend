import * as Brevo from "@getbrevo/brevo";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export enum EmailTemplate {
  WELCOME = "welcome",
  OTP_VERIFICATION = "otp-verification",
  PASSWORD_RESET = "password-reset",
  ORDER_CONFIRMATION = "order-confirmation",
  ORDER_CANCELLED = "order-cancelled",
  ORDER_STATUS_UPDATE = "order-status-update",
}

interface SendEmailProps {
  to: string;
  subject: string;
  template: EmailTemplate;
  context: Record<string, any>;
}

export class EmailService {
  private static brevoClient = new Brevo.TransactionalEmailsApi();

  static {
    if (process.env.BREVO_API_KEY) {
      this.brevoClient.setApiKey(
        Brevo.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY,
      );
    }
  }

  private static getTemplate(templateName: EmailTemplate, context: any) {
    const filePath = path.join(
      __dirname,
      "mail-templates",
      `${templateName}.html`,
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(`Template not found: ${filePath}`);
    }

    const source = fs.readFileSync(filePath, "utf-8");
    return handlebars.compile(source)(context);
  }

  private static async sendViaWorker(props: SendEmailProps) {
    if (!process.env.EMAIL_WORKER_URL) {
      throw new Error("EMAIL_WORKER_URL not configured");
    }

    await fetch(process.env.EMAIL_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(props),
    });
  }

  private static async sendViaBrevo(props: SendEmailProps) {
    const htmlContent = this.getTemplate(props.template, props.context);

    const sendSmtpEmail: Brevo.SendSmtpEmail = {
      sender: { name: "Shopery", email: process.env.SMTP_FROM },
      to: [{ email: props.to }],
      subject: props.subject,
      htmlContent,
    };

    await this.brevoClient.sendTransacEmail(sendSmtpEmail);
  }

  static async sendMail(props: SendEmailProps) {
    try {
      if (!process.env.EMAIL_PROVIDER) {
        console.warn("No EMAIL_PROVIDER set");
        return { success: false };
      }

      if (process.env.EMAIL_PROVIDER === "worker") {
        await this.sendViaWorker(props);
      } else {
        await this.sendViaBrevo(props);
      }

      return { success: true };
    } catch (err: any) {
      console.error("Email failed:", err?.message || err);
      return { success: false };
    }
  }
}

// d3c63183-97b2-4465-9861-5eb0598689de

// import Handlebars from "handlebars";

// export interface Env {
//   BREVO_API_KEY: string;
//   SMTP_FROM: string;
// }

// interface EmailRequest {
//   to: string;
//   subject: string;
//   template: string;
//   context: Record<string, any>;
// }

// const templates: Record<string, Handlebars.TemplateDelegate> = {};

// async function loadTemplate(name: string) {
//   if (templates[name]) return templates[name];

//   const html = await fetch(
//     `https://raw.githubusercontent.com/jettechnologies/shopery-commerce-backend/main/mail-templates/${name}.html`,
//   ).then((res) => res.text());

//   const compiled = Handlebars.compile(html);
//   templates[name] = compiled;
//   return compiled;
// }

// export default {
//   async fetch(request: Request, env: Env) {
//     if (request.method !== "POST") {
//       return new Response("Method Not Allowed", { status: 405 });
//     }

//     try {
//       const body: EmailRequest = await request.json();

//       const compiledTemplate = await loadTemplate(body.template);
//       const htmlContent = compiledTemplate(body.context);

//       // 🔥 Direct API Call (No SDK)
//       const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "api-key": env.BREVO_API_KEY,
//         },
//         body: JSON.stringify({
//           sender: {
//             name: "Shopery",
//             email: env.SMTP_FROM,
//           },
//           to: [{ email: body.to }],
//           subject: body.subject,
//           htmlContent,
//         }),
//       });

//       if (!brevoResponse.ok) {
//         const errorText = await brevoResponse.text();
//         throw new Error(errorText);
//       }

//       return new Response(JSON.stringify({ success: true }), {
//         status: 200,
//       });
//     } catch (err: any) {
//       console.error("Email worker failed:", err);
//       return new Response(
//         JSON.stringify({ success: false, error: err.message }),
//         { status: 500 },
//       );
//     }
//   },
// };

// import * as Brevo from "@getbrevo/brevo";
// import Handlebars from "handlebars";

// export interface Env {
//   BREVO_API_KEY: string;
//   SMTP_FROM: string;
// }

// interface EmailRequest {
//   to: string;
//   subject: string;
//   template: string;
//   context: Record<string, any>;
// }

// const templates: Record<string, Handlebars.TemplateDelegate> = {};

// async function loadTemplate(name: string) {
//   if (templates[name]) return templates[name];

//   const html = await fetch(
//     `https://raw.githubusercontent.com/jettechnologies/shopery-commerce-backend/main/mail-templates/${name}.html`,
//   ).then((res) => res.text());

//   const compiled = Handlebars.compile(html);
//   templates[name] = compiled;
//   return compiled;
// }

// export default {
//   async fetch(request: Request, env: Env) {
//     if (request.method !== "POST") {
//       return new Response("Method Not Allowed", { status: 405 });
//     }

//     try {
//       const body: EmailRequest = await request.json();

//       // Initialize Brevo INSIDE fetch (important)
//       const brevoClient = new Brevo.TransactionalEmailsApi();
//       brevoClient.setApiKey(
//         Brevo.TransactionalEmailsApiApiKeys.apiKey,
//         env.BREVO_API_KEY,
//       );

//       const compiledTemplate = await loadTemplate(body.template);
//       const htmlContent = compiledTemplate(body.context);

//       const sendSmtpEmail: Brevo.SendSmtpEmail = {
//         sender: { name: "Shopery", email: env.SMTP_FROM },
//         to: [{ email: body.to }],
//         subject: body.subject,
//         htmlContent,
//       };

//       await brevoClient.sendTransacEmail(sendSmtpEmail);

//       return new Response(JSON.stringify({ success: true }), {
//         status: 200,
//       });
//     } catch (err: any) {
//       console.error("Email worker failed:", err);
//       return new Response(
//         JSON.stringify({ success: false, error: err.message }),
//         { status: 500 },
//       );
//     }
//   },
// };
