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
  
  // Define headers to match Website Submissions tab exactly
  const headers = [
    'Timestamp',
    'First Name',
    'Last Name', 
    'Street Address',
    'Street Address Line 2',
    'City',
    'State / Province',
    'Postal / Zip Code',
    'Phone Number',
    'Email',
    // Audio Section
    'Audio Positions',
    'Please Select All Gear That You Operate',
    'Years of Experience',
    'Audio Shows',
    'Main Strengths',
    // Video Section  
    'Video Positions',
    'Please Select All Gear That You Operate',
    'Years of Experience',
    'Video Shows',
    'Main Strengths',
    // Lighting Section
    'Lighting Positions',
    'Please Select All Gear That You Operate',
    'Years of Experience',
    'Lighting Shows',
    'Main Strengths',
    // Management Section
    'Management Positions',
    'Management Skillsets',
    'Years of Experience',
    'Shows',
    'Experience',
    // Assist Positions Section
    'Assist Positions',
    'Equipment Comfort Level',
    'Years of Experience',
    'Shows',
    'Main Strengths',
    // Additional Info
    'What companies have you worked with',
    'Additional Skills',
    'Additional Comments',
    'Have You Worked With Prestige Before?',
    'Referred By',
    'LinkedIn Profile'
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
  
  // Prepare row data matching the exact Website Submissions tab structure
  const rowData = [
    timestamp,                                          // Timestamp
    formData.firstName || '',                          // First Name
    formData.lastName || '',                           // Last Name
    formData.streetAddress || '',                      // Street Address
    formData.streetAddress2 || '',                     // Street Address Line 2
    formData.city || '',                               // City
    formData.state || '',                              // State / Province
    formData.postalCode || '',                         // Postal / Zip Code
    formData.phoneNumber || '',                        // Phone Number
    formData.email || '',                              // Email
    // Audio Section
    arrayToString(formData.audioPositions),            // Audio Positions
    arrayToString(formData.audioGearOperated),         // Please Select All Gear That You Operate
    formData.audioYearsExperience || '',               // Years of Experience
    arrayToString(formData.audioShowExperience),       // Audio Shows
    formData.audioStrengths || '',                     // Main Strengths
    // Video Section
    arrayToString(formData.videoPositions),            // Video Positions
    arrayToString(formData.videoGearOperated),         // Please Select All Gear That You Operate
    formData.videoYearsExperience || '',               // Years of Experience
    arrayToString(formData.videoShowExperience),       // Video Shows
    formData.videoStrengths || '',                     // Main Strengths
    // Lighting Section
    arrayToString(formData.lightingPositions),         // Lighting Positions
    arrayToString(formData.lightingGearOperated),      // Please Select All Gear That You Operate
    formData.lightingYearsExperience || '',            // Years of Experience
    arrayToString(formData.lightingShowExperience),    // Lighting Shows
    formData.lightingStrengths || '',                  // Main Strengths
    // Management Section
    arrayToString(formData.managementPositions),       // Management Positions
    arrayToString(formData.managementSkillsets),       // Management Skillsets
    formData.managementYearsExperience || '',          // Years of Experience
    arrayToString(formData.managementShowExperience),  // Shows
    formData.managementExperience || '',               // Experience
    // Assist Positions Section
    arrayToString(formData.assistPositions),           // Assist Positions
    formData.assistEquipmentComfort || '',             // Equipment Comfort Level
    formData.assistYearsExperience || '',              // Years of Experience
    arrayToString(formData.assistShowExperience),      // Shows
    formData.assistMainStrengths || '',                // Main Strengths
    // Additional Info
    formData.companiesWorkedWith || '',                // What companies have you worked with
    formData.additionalSkills || '',                   // Additional Skills
    formData.additionalComments || '',                 // Additional Comments
    formData.workedWithPrestige || '',                 // Have You Worked With Prestige Before?
    formData.referredBy || '',                         // Referred By
    formData.linkedinProfile || ''                     // LinkedIn Profile
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