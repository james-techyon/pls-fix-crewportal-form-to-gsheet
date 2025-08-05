# Email Logic Documentation

## Current Email Configuration (Main Branch)

### Recipients
- **To:** james@techyon.com (primary recipient)
- **CC:** jmichaeldeseno@gmail.com (carbon copy)

### Email Types

#### 1. Applicant Confirmation Email
- **Trigger:** Sent when `EMAIL_CONFIG.sendToApplicant` is true AND applicant provided email
- **Subject:** "Prestige Labor Solutions - Application Received"
- **Content:** 
  - Personalized greeting with applicant's name
  - Confirmation of receipt
  - Brief summary (name, email, phone, location)
  - Standard closing message

#### 2. Admin Notification Email
- **Trigger:** Sent when `EMAIL_CONFIG.sendToAdmins` is true AND admin email configured
- **Subject:** "New Freelancer Application: [Full Name]"
- **Format:** HTML email with styled sections
- **Content Includes:**
  - Timestamp of submission
  - Complete applicant information
  - Skills breakdown by category (Audio, Video, Lighting, Management)
  - Years of experience
  - Additional information (companies worked with, referrals, etc.)
  - Additional comments (if provided)
  - Quick action buttons to view in Google Sheets
  - Row numbers for both Raw Submissions and Operations Ready sheets

### Email Configuration Settings
```javascript
const EMAIL_CONFIG = {
  to: 'james@techyon.com',        // Primary recipient
  cc: 'jmichaeldeseno@gmail.com', // CC recipient(s) - comma-separated list
  sendToApplicant: true,           // Whether to send confirmation to applicant
  sendToAdmins: true               // Whether to send notification to admin emails above
};
```

### How Emails Are Sent
1. Form submission triggers `doPost()` function in Google Apps Script
2. After data is saved to sheets, `sendEmailNotifications()` is called
3. Function checks configuration flags and sends appropriate emails
4. Uses Google's `MailApp.sendEmail()` service
5. Errors in email sending are caught but don't prevent form submission success

### Features
- HTML formatted admin emails for better readability
- Direct links to Google Sheets with specific row references
- Conditional content (only shows sections with data)
- Error handling to prevent email failures from blocking submissions
- Support for multiple CC recipients (comma-separated)

### To Update Email Recipients
1. Edit `Code.gs` file
2. Update the `EMAIL_CONFIG` object at the top
3. Redeploy the Google Apps Script

### Important Notes
- Email sending requires Google Apps Script authorization
- Daily email quotas apply (varies by Google account type)
- Emails are sent from the Google account that deployed the script
- Both email types can be independently enabled/disabled