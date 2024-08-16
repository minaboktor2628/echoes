import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import * as process from "node:process";

const createTransporter = async () => {
  return nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_DOMAIN,
      pass: process.env.ZOHO_PASS,
    },
  });
};

export async function SendMail({ options }: { options: Mail.Options }) {
  console.log("sending mail...");
  const { from, ...restOptions } = options;
  const transporter = await createTransporter();
  return transporter.sendMail({
    ...restOptions,

    from: `Ekkos <${process.env.ZOHO_DOMAIN}>`,
  });
}
