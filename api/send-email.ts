import sendgrid from "@sendgrid/mail";

/** type imports */
import type { VercelRequest, VercelResponse } from "@vercel/node";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "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";
const SENDGRID_TEMPLATE_ID = process.env.SENDGRID_TEMPLATE_ID || "d-18489a88b05442a4b773e4b4b442c341";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "info@intn.city";

sendgrid.setApiKey(SENDGRID_API_KEY);

export default async (request: VercelRequest, response: VercelResponse) => {
  try {
      const result = await sendgrid.send({
        to: request.query.to || "blakedong@gmail.com", 
        from: {
          email: SENDER_EMAIL,      // Must be a verified sender in Sendgrid
          name: "INTN.CITY",
        },
        templateId: SENDGRID_TEMPLATE_ID,
        dynamicTemplateData: {
          app_id: request.query.app_id || "## placeholder app id ##"
        }
      });
      response.status(200).json({
        success: true,
        app_id: request.query.app_id,
      });      
  } catch (err: any) {
    response.status(400).json({
      success: false,
      error:
        typeof err !== "object" || err instanceof Error
          ? err.toString()
          : JSON.stringify(err),
    });
  }
};