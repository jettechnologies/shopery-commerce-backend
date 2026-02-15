import templates from "./template";

export interface Env {
  BREVO_API_KEY: string;
  SMTP_FROM: string;
}

interface EmailRequest {
  to: string;
  subject: string;
  template: keyof typeof templates;
  context: Record<string, any>;
}

export default {
  async fetch(request: Request, env: Env) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const body: EmailRequest = await request.json();

      // ✅ Validate template exists
      if (!templates[body.template]) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid template" }),
          { status: 400 },
        );
      }

      // ✅ Render precompiled template (SAFE)
      const htmlContent = templates[body.template](body.context);

      // ✅ Send to Brevo
      const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: "Shopery",
            email: env.SMTP_FROM,
          },
          to: [{ email: body.to }],
          subject: body.subject,
          htmlContent,
        }),
      });

      if (!brevoResponse.ok) {
        const errorText = await brevoResponse.text();
        throw new Error(errorText);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
    } catch (err: any) {
      console.error("Email worker failed:", err);
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { status: 500 },
      );
    }
  },
};

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
