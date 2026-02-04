const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const loadTemplate = (templateName, variables) => {
  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);

  if (!fs.existsSync(templatePath)) {
    logger.error(`Email template not found: ${templatePath}`);
    throw new Error(`Email template not found: ${templateName}`);
  }

  let template = fs.readFileSync(templatePath, 'utf8');

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, value);
  }

  return template;
};

const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  const html = loadTemplate('welcome', {
    name: user.name,
    email: user.email,
    frontendUrl: process.env.FRONTEND_URL,
  });

  return sendEmail(user.email, 'Welcome to Our Blog!', html);
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = loadTemplate('passwordReset', {
    name: user.name,
    resetUrl,
    expiresIn: '15 minutes',
  });

  return sendEmail(user.email, 'Password Reset Request', html);
};

const sendPasswordResetConfirmation = async (user) => {
  const html = loadTemplate('passwordResetConfirmation', {
    name: user.name,
    frontendUrl: process.env.FRONTEND_URL,
  });

  return sendEmail(user.email, 'Password Reset Successful', html);
};

const sendCommentNotification = async (postAuthor, commenter, post, comment) => {
  const postUrl = `${process.env.FRONTEND_URL}/posts/${post._id}`;

  const html = loadTemplate('commentNotification', {
    authorName: postAuthor.name,
    commenterName: commenter.name,
    postTitle: post.title,
    commentContent: comment.content.substring(0, 200),
    postUrl,
  });

  return sendEmail(postAuthor.email, `New Comment on Your Post: ${post.title}`, html);
};

const sendReplyNotification = async (commentAuthor, replier, comment, reply) => {
  const html = loadTemplate('replyNotification', {
    authorName: commentAuthor.name,
    replierName: replier.name,
    originalComment: comment.content.substring(0, 100),
    replyContent: reply.content.substring(0, 200),
    frontendUrl: process.env.FRONTEND_URL,
  });

  return sendEmail(commentAuthor.email, 'Someone Replied to Your Comment', html);
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
  sendCommentNotification,
  sendReplyNotification,
};
