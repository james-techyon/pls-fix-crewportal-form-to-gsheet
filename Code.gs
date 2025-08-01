// Google Apps Script for Crew Portal Form Submission
// This script handles form submissions and writes data to Google Sheets

// Configuration
const SHEET_ID = '1Z1NTy7di7Xx4M5j1Ji4dKdjMymwcwOOnYbMxUWa4SMI';
const SHEET_NAME = 'Form Responses'; // Update this to match your sheet name

// Main function to handle POST requests
function doPost(e) {
  try {
    // Parse the form data
    const formData = JSON.parse(e.postData.contents);
    
    // Get the spreadsheet and sheet
    let sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      sheet = createSheet();
    }
    
    // Process and append the data
    const result = appendFormData(sheet, formData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Form submitted successfully',
      row: result
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to create sheet with headers if it doesn't exist
function createSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  
  // Check if sheet exists first
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (sheet) {
    return sheet;
  }
  
  // Create new sheet
  sheet = spreadsheet.insertSheet(SHEET_NAME);
  
  // Define headers based on form fields
  const headers = [
    'Timestamp',
    'First Name',
    'Last Name',
    'Street Address',
    'Street Address Line 2',
    'City',
    'State/Province',
    'Postal/Zip Code',
    'Phone Number',
    'Email',
    // Audio Section
    'Audio Positions',
    'Audio Gear Operated',
    'Audio Years Experience',
    'Audio Show Experience',
    'Audio Strengths',
    // Video Section
    'Video Positions',
    'Video Gear Operated',
    'Video Years Experience',
    'Video Show Experience',
    'Video Strengths',
    // Lighting Section
    'Lighting Positions',
    'Lighting Gear Operated',
    'Lighting Years Experience',
    'Lighting Show Experience',
    'Lighting Strengths',
    // Management Section
    'Management Positions',
    'Management Skillsets',
    'Management Years Experience',
    'Management Show Experience',
    'Management Experience',
    // Assist Section
    'Assist Positions',
    'Assist Equipment Comfort',
    'Assist Years Experience',
    'Assist Show Experience',
    'Assist Main Strengths',
    // Additional Info
    'Companies Worked With',
    'Additional Skills',
    'Additional Comments',
    'Worked with Prestige Before',
    'Referred By',
    'LinkedIn Profile',
    'Profile Picture URL'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  
  return sheet;
}

// Function to append form data to sheet
function appendFormData(sheet, formData) {
  const timestamp = new Date();
  
  // Handle file upload if present
  let profilePictureUrl = '';
  if (formData.profilePictureData) {
    profilePictureUrl = uploadFile(
      formData.profilePictureData,
      formData.profilePictureName || 'profile.jpg',
      formData.profilePictureMimeType || 'image/jpeg'
    );
  }
  
  // Prepare row data in the correct order
  const rowData = [
    timestamp,
    formData.firstName || '',
    formData.lastName || '',
    formData.streetAddress || '',
    formData.streetAddress2 || '',
    formData.city || '',
    formData.state || '',
    formData.postalCode || '',
    formData.phoneNumber || '',
    formData.email || '',
    // Audio Section
    arrayToString(formData.audioPositions),
    arrayToString(formData.audioGearOperated),
    formData.audioYearsExperience || '',
    arrayToString(formData.audioShowExperience),
    formData.audioStrengths || '',
    // Video Section
    arrayToString(formData.videoPositions),
    arrayToString(formData.videoGearOperated),
    formData.videoYearsExperience || '',
    arrayToString(formData.videoShowExperience),
    formData.videoStrengths || '',
    // Lighting Section
    arrayToString(formData.lightingPositions),
    arrayToString(formData.lightingGearOperated),
    formData.lightingYearsExperience || '',
    arrayToString(formData.lightingShowExperience),
    formData.lightingStrengths || '',
    // Management Section
    arrayToString(formData.managementPositions),
    arrayToString(formData.managementSkillsets),
    formData.managementYearsExperience || '',
    arrayToString(formData.managementShowExperience),
    formData.managementExperience || '',
    // Assist Section
    arrayToString(formData.assistPositions),
    formData.assistEquipmentComfort || '',
    formData.assistYearsExperience || '',
    arrayToString(formData.assistShowExperience),
    formData.assistMainStrengths || '',
    // Additional Info
    formData.companiesWorkedWith || '',
    formData.additionalSkills || '',
    formData.additionalComments || '',
    formData.workedWithPrestige || '',
    formData.referredBy || '',
    formData.linkedinProfile || '',
    profilePictureUrl
  ];
  
  // Append the row
  sheet.appendRow(rowData);
  
  // Send confirmation email if requested
  if (formData.email) {
    sendConfirmationEmail(formData);
  }
  
  return sheet.getLastRow();
}

// Helper function to convert array to comma-separated string
function arrayToString(arr) {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.join(', ');
}

// Function to send confirmation email
function sendConfirmationEmail(formData) {
  const subject = 'Prestige Labor Solutions - Application Received';
  const body = `
Dear ${formData.firstName} ${formData.lastName},

Thank you for submitting your application to Prestige Labor Solutions.

We have received your information and will review it shortly. If your qualifications match our current needs, a member of our team will contact you.

Application Summary:
- Name: ${formData.firstName} ${formData.lastName}
- Email: ${formData.email}
- Phone: ${formData.phoneNumber}
- Location: ${formData.city}, ${formData.state}

Best regards,
Prestige Labor Solutions Team
  `;
  
  try {
    MailApp.sendEmail(formData.email, subject, body);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Handle file uploads
function uploadFile(base64Data, fileName, mimeType) {
  try {
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
    const folder = getOrCreateFolder('Crew Portal Uploads');
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (error) {
    console.error('Error uploading file:', error);
    return '';
  }
}

// Get or create folder for uploads
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

// Test function for debugging
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phoneNumber: '123-456-7890',
        city: 'Test City',
        state: 'TS',
        audioPositions: ['A1', 'A2'],
        audioYearsExperience: '5',
        workedWithPrestige: 'No'
      })
    }
  };
  
  const result = doPost(testData);
  console.log(result.getContent());
}

// CORS handling for web app
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ready',
    message: 'Crew Portal Form API is running'
  })).setMimeType(ContentService.MimeType.JSON);
}