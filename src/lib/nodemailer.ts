import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export const transport = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.GMAIL_DOMAIN,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export function SendMail({ options }: { options: Mail.Options }) {
  const { from, ...restOptions } = options;
  return transport.sendMail({
    ...restOptions,
    from: `Ekkos <${process.env.GMAIL_DOMAIN}>`,
  });
}
