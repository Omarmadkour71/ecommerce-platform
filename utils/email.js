const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user, url) {
    (this.from = process.env.EMAIL_FROM),
      (this.to = user.email),
      (this.firstName = user.name),
      (this.url = url);
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(subject, message) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: message,
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendHello() {
    await this.send("Hello", "Welcome to Our Online Shop");
  }

  async sendResetToken() {
    await this.send(
      "Password Reset Token",
      `Here is your Password Reset Token: ${this.url} (Availabe only for 10 minutes)`
    );
  }
};
