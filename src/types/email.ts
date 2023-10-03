export type Form = {
  from: string;
  subject: string;
  message: string;
};

export type EmailData = Form & { host: string };
