const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    await transactionalEmailApi.sendTransacEmail({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: "Task Management System"
      },
      to: [
        {
          email: toEmail
        }
      ],
      subject: subject,
      htmlContent: htmlContent
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Brevo email error:", error.response?.body || error.message);
  }
};

module.exports = sendEmail;