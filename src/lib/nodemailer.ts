import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { google } from "googleapis";
import * as process from "node:process";

const createTransporter = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_OAUTH_CLIENT_ID,
    process.env.GMAIL_OAUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground",
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
  });

  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    //es-lint ignore-next-line
    // @ts-ignore
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_DOMAIN,
      clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
      clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
};

export async function SendMail({ options }: { options: Mail.Options }) {
  console.log("sending mail...");
  const { from, ...restOptions } = options;
  const transporter = await createTransporter();
  return transporter.sendMail({
    ...restOptions,
    from: `Ekkos <${process.env.GMAIL_DOMAIN}>`,
  });
}
