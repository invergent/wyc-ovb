import EmailService from '../../services/EmailService';

const urls = {
  development: 'example.com:4200',
  cloud_test: 'cleontime-ui-test.whytecleon.ng',
  production: 'cleontime.whytecleon.ng'
};

class EmailConstructor {
  static async create(emailDetails) {
    const { email: staffEmailAddress, lineManager, emailTemplateName } = emailDetails;
    const emailTemplate = await EmailService.fetchEmailTemplateByName(emailTemplateName);
    const { htmlMessage, subject } = emailTemplate;

    let toEmailAddress;

    if (emailTemplateName.includes('Staff')) {
      toEmailAddress = staffEmailAddress;
    } else {
      toEmailAddress = lineManager.email;
    }

    const personalizedEmail = EmailConstructor.personalizeMessage(emailDetails, htmlMessage);
    return {
      to: toEmailAddress,
      subject,
      html: personalizedEmail
    };
  }

  static async createForMany(reciepients, emailTemplateName) {
    const emailTemplate = await EmailService.fetchEmailTemplateByName(emailTemplateName);
    const { htmlMessage, subject } = emailTemplate;

    const personalizedEmails = reciepients.map((reciepient) => {
      const { email: reciepientEmailAddress } = reciepient;
      const personalizedEmail = EmailConstructor.personalizeMessage(reciepient, htmlMessage);

      return {
        to: reciepientEmailAddress,
        subject,
        html: personalizedEmail
      };
    });

    return personalizedEmails;
  }

  static personalizeMessage(reciepient, htmlMessage) {
    const {
      staffId,
      firstname: staffFirstName,
      lastname: staffLastName,
      adminFirstName,
      hash,
      password,
      year,
      monthOfClaim,
      amount,
      lineManager
    } = reciepient;
    let lineManagerFirstName;
    let amountLocale;

    if (lineManager) lineManagerFirstName = lineManager.firstname;
    if (amount) amountLocale = amount.toLocaleString();
    return htmlMessage
      .replace(/{{staffFirstName}}/g, staffFirstName)
      .replace(/{{staffLastName}}/g, staffLastName)
      .replace(/{{lineManagerFirstName}}/g, lineManagerFirstName)
      .replace(/{{adminFirstName}}/g, adminFirstName)
      .replace(/{{url}}/g, urls[process.env.PLATFORM_ENV])
      .replace(/{{hash}}/g, hash)
      .replace(/{{amount}}/g, amountLocale)
      .replace(/{{monthOfClaim}}/g, monthOfClaim)
      .replace(/{{year}}/g, year)
      .replace(/{{staffId}}/g, staffId)
      .replace(/{{password}}/g, password);
  }
}

export default EmailConstructor;
