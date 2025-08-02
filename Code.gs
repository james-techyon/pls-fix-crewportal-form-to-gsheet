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
  
  // Define headers to match existing table structure
  const headers = [
    'Submitted on',
    'Full Name',
    'Company Name if any',
    'Phone',
    'Email',
    'Direct Deposit ACH Request Form',
    'W - 9 form',
    'PLS Independent Contractor Agreement Rev',
    'Notes',
    'General',
    'Audio',
    'Video',
    'Lighting',
    'LED',
    'Projection',
    'Scenic',
    'Camera',
    'Information Technology',
    'Breakout',
    'Computer',
    'Leadership',
    'Equipment Operator',
    'Years of Experience',
    'Billing Address',
    'What State Do You Live In?',
    'Major Cities You Work As A Local',
    'How did you hear about us',
    'Rates',
    'Onboarding Docs Status',
    'Quickbooks Singup Status',
    'Chase Vendor Status',
    'Organized in Contacts & by State',
    'covid vaccination card',
    'Onsite Ranking',
    'Lead Proformance',
    'select',
    'checkbox',
    'Docusign',
    'GOOGLE review'
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
  
  // Combine first and last name
  const fullName = ((formData.firstName || '') + ' ' + (formData.lastName || '')).trim();
  
  // Combine address fields
  const billingAddress = [
    formData.streetAddress,
    formData.streetAddress2,
    formData.city,
    formData.state,
    formData.postalCode
  ].filter(Boolean).join(', ');
  
  // Determine years of experience (take the highest value from all experience fields)
  const yearsOfExperience = getHighestExperience([
    formData.audioYearsExperience,
    formData.videoYearsExperience,
    formData.lightingYearsExperience,
    formData.managementYearsExperience,
    formData.assistYearsExperience
  ]);
  
  // Map positions to skill categories
  const skillCategories = mapSkillCategories(formData);
  
  // Combine all notes/comments
  const notes = [
    formData.additionalComments,
    formData.audioStrengths ? 'Audio: ' + formData.audioStrengths : '',
    formData.videoStrengths ? 'Video: ' + formData.videoStrengths : '',
    formData.lightingStrengths ? 'Lighting: ' + formData.lightingStrengths : '',
    formData.managementExperience ? 'Management: ' + formData.managementExperience : '',
    formData.assistMainStrengths ? 'Assist: ' + formData.assistMainStrengths : ''
  ].filter(Boolean).join(' | ');
  
  // Prepare row data in the correct order matching the headers
  const rowData = [
    timestamp,                                          // Submitted on
    fullName,                                          // Full Name
    formData.companiesWorkedWith || '',               // Company Name if any
    formData.phoneNumber || '',                       // Phone
    formData.email || '',                             // Email
    '',                                                // Direct Deposit ACH Request Form
    '',                                                // W - 9 form
    '',                                                // PLS Independent Contractor Agreement Rev
    notes,                                             // Notes
    skillCategories.general || '',                    // General
    skillCategories.audio || '',                      // Audio
    skillCategories.video || '',                      // Video
    skillCategories.lighting || '',                   // Lighting
    skillCategories.led || '',                        // LED
    skillCategories.projection || '',                 // Projection
    skillCategories.scenic || '',                     // Scenic
    skillCategories.camera || '',                     // Camera
    skillCategories.it || '',                         // Information Technology
    skillCategories.breakout || '',                   // Breakout
    skillCategories.computer || '',                   // Computer
    skillCategories.leadership || '',                 // Leadership
    skillCategories.equipment || '',                  // Equipment Operator
    yearsOfExperience,                                // Years of Experience
    billingAddress,                                    // Billing Address
    formData.state || '',                             // What State Do You Live In?
    formData.city || '',                              // Major Cities You Work As A Local
    formData.referredBy || '',                        // How did you hear about us
    '',                                                // Rates
    '',                                                // Onboarding Docs Status
    '',                                                // Quickbooks Singup Status
    '',                                                // Chase Vendor Status
    '',                                                // Organized in Contacts & by State
    profilePictureUrl,                                // covid vaccination card (using profile pic field)
    '',                                                // Onsite Ranking
    '',                                                // Lead Proformance
    '',                                                // select
    '',                                                // checkbox
    '',                                                // Docusign
    ''                                                 // GOOGLE review
  ];
  
  // Append the row
  sheet.appendRow(rowData);
  
  // Send confirmation email if requested
  if (formData.email) {
    sendConfirmationEmail(formData);
  }
  
  return sheet.getLastRow();
}

// Helper function to get highest experience level
function getHighestExperience(experienceFields) {
  const experienceOrder = ['10+ Years', '5 - 10 Years', '2 - 4 Years', '0 - 1 Years'];
  
  for (let level of experienceOrder) {
    for (let field of experienceFields) {
      if (field && field.includes(level)) {
        return level;
      }
    }
  }
  
  // If any experience is provided but doesn't match the pattern, return the first non-empty one
  for (let field of experienceFields) {
    if (field) return field;
  }
  
  return '';
}

// Helper function to map skills to categories
function mapSkillCategories(formData) {
  const categories = {
    general: [],
    audio: [],
    video: [],
    lighting: [],
    led: [],
    projection: [],
    scenic: [],
    camera: [],
    it: [],
    breakout: [],
    computer: [],
    leadership: [],
    equipment: []
  };
  
  // Map audio positions
  if (formData.audioPositions && formData.audioPositions.length > 0) {
    categories.audio = categories.audio.concat(
      formData.audioPositions.map(pos => {
        if (pos.includes('A1')) return 'Audio Engineer (A1)';
        if (pos.includes('A2')) return 'Audio Engineer (A2)';
        if (pos.includes('RF')) return 'Wireless Frequency Coordinator';
        return 'Audio Technician';
      })
    );
  }
  
  // Map video positions
  if (formData.videoPositions && formData.videoPositions.length > 0) {
    categories.video = categories.video.concat(
      formData.videoPositions.map(pos => {
        if (pos.includes('V1')) return 'Video Engineer (V1)';
        if (pos.includes('Engineer')) return 'Video Technician';
        if (pos.includes('Shader')) return 'Video Shader Operator';
        return 'Video Technician';
      })
    );
  }
  
  // Map lighting positions
  if (formData.lightingPositions && formData.lightingPositions.length > 0) {
    categories.lighting = categories.lighting.concat(
      formData.lightingPositions.map(pos => {
        if (pos.includes('L1')) return 'Lighting Engineer (L1)';
        if (pos.includes('Programmer')) return 'Lighting Programmer';
        if (pos.includes('Designer')) return 'Lighting Designer (LD)';
        if (pos.includes('Spot')) return 'Spot Operator';
        return 'Lighting Technician';
      })
    );
  }
  
  // Map management positions to leadership
  if (formData.managementPositions && formData.managementPositions.length > 0) {
    categories.leadership = formData.managementPositions.map(pos => {
      if (pos.includes('Producer')) return 'Project Manager';
      if (pos.includes('Director')) return 'Technical Director';
      if (pos.includes('Coordinator')) return 'Steward';
      return 'Project Manager';
    });
  }
  
  // Map assist positions to breakout
  if (formData.assistPositions && formData.assistPositions.length > 0) {
    categories.breakout = formData.assistPositions.map(pos => {
      if (pos.includes('Audio')) return 'Breakout A1';
      if (pos.includes('Video')) return 'Breakout V1';
      if (pos.includes('Lighting')) return 'Breakout L1';
      if (pos.includes('Operator')) return 'Breakout Operator';
      return 'Breakout Technician';
    });
  }
  
  // Map equipment skills
  const equipmentSkills = [];
  if (formData.audioGearOperated && formData.audioGearOperated.length > 0) {
    equipmentSkills.push(...formData.audioGearOperated);
  }
  if (formData.videoGearOperated && formData.videoGearOperated.length > 0) {
    equipmentSkills.push(...formData.videoGearOperated);
  }
  if (formData.lightingGearOperated && formData.lightingGearOperated.length > 0) {
    equipmentSkills.push(...formData.lightingGearOperated);
  }
  if (formData.assistEquipmentComfort) {
    equipmentSkills.push(formData.assistEquipmentComfort);
  }
  
  // Check for specific equipment types
  equipmentSkills.forEach(skill => {
    if (skill && (skill.toLowerCase().includes('forklift') || 
                  skill.toLowerCase().includes('scissor') || 
                  skill.toLowerCase().includes('boom') ||
                  skill.toLowerCase().includes('lull'))) {
      if (!categories.equipment.includes(skill)) {
        categories.equipment.push(skill);
      }
    }
  });
  
  // Add general categories
  categories.general.push('Stagehand', 'AV Technician');
  
  // Convert arrays to comma-separated strings
  Object.keys(categories).forEach(key => {
    categories[key] = arrayToString(categories[key]);
  });
  
  return categories;
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