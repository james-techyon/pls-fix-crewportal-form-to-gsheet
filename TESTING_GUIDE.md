# Testing Guide - Onboarding Requirements Feature

## Overview
This guide helps you test the new tax, banking, and terms & conditions sections added to the freelancer application form.

## Branch Information
- Feature Branch: `feature/onboarding-requirements`
- GitHub URL: https://github.com/james-techyon/pls-fix-crewportal-form-to-gsheet/tree/feature/onboarding-requirements

## New Features to Test

### 1. Tax Information Section
- **Radio toggle**: Switch between "Upload W-9" and "Enter Information"
- **W-9 Upload**: File upload field (accepts PDF, JPG, PNG)
- **Manual Entry**: 
  - Legal Business Name
  - Business Type (dropdown)
  - Tax ID (EIN or SSN)

### 2. Banking Details Section
- Bank Name
- Account Type (Checking/Savings)
- Routing Number (9 digits, validated)
- Account Number (password field)
- Account Number Confirmation (must match)

### 3. Terms & Conditions Section
- Scrollable terms text
- Checkbox for agreement acceptance
- Electronic signature field
- Auto-populated date field

### 4. Eligibility Tracking
The form now tracks eligibility based on:
- **Work Eligibility** (ELIGIBLE/INELIGIBLE):
  - Requires: Tax information (W-9 or manual entry)
  - Requires: Terms acceptance with e-signature
- **Payment Eligibility**:
  - Requires: Banking details

## Test Scenarios

### Scenario 1: Fully Eligible Submission
1. Fill all required form fields
2. Choose "Upload W-9" and select a file
3. Enter complete banking details
4. Accept terms and provide e-signature
5. Submit form
6. **Expected**: Success message shows "FULLY ELIGIBLE for work assignments and payments"

### Scenario 2: Eligible for Work Only
1. Fill all required form fields
2. Provide tax information (either method)
3. Skip banking details
4. Accept terms and provide e-signature
5. Submit form
6. **Expected**: Success message shows "ELIGIBLE for work assignments" with note about missing banking for payments

### Scenario 3: Ineligible Submission
1. Fill basic form fields only
2. Skip tax information
3. Skip banking details
4. Skip terms acceptance
5. Submit form
6. **Expected**: 
   - Warning appears before submission listing missing items
   - Success message shows "INELIGIBLE for work assignments"
   - Lists all missing requirements

### Scenario 4: Validation Testing
1. Enter mismatched account numbers
2. Enter routing number with less than 9 digits
3. Try to submit without selecting tax method
4. **Expected**: Validation errors appear

## Google Sheets Verification

After submission, check the Google Sheet:
1. **Raw Submissions** tab should contain:
   - All form data including new fields
   - Eligibility Status column
   - Is Eligible column (true/false)
   - Missing Requirements column

2. **Operations Ready** tab should contain:
   - Document status columns showing Yes/No
   - Work Eligibility Status
   - Payment Setup Status
   - Missing Requirements list

## Email Notification Verification

Check that admin emails include:
- Eligibility status in subject line
- Prominent eligibility badge in email body
- Missing requirements section (if applicable)
- All new fields properly displayed

## Deployment Options

### Option 1: Test on GitHub Pages (Feature Branch)
1. Go to repository Settings > Pages
2. Change branch from `main` to `feature/onboarding-requirements`
3. Wait for deployment
4. Test at: https://james-techyon.github.io/pls-fix-crewportal-form-to-gsheet/

### Option 2: Local Testing
```bash
# Start local server
python3 -m http.server 8080

# Open in browser
http://localhost:8080
```

### Option 3: Review Before Merging
1. Create pull request from feature branch
2. Review all changes
3. Test thoroughly before merging to main

## Important Notes

1. **Google Apps Script**: If testing with actual submissions, ensure the Google Apps Script is updated and redeployed with the new code from `Code.gs`

2. **Email Recipients**: Currently configured to send to:
   - To: kyle@prestigelaborsolutions.com, ray@prestigelaborsolutions.com
   - CC: rosie@prestigelaborsolutions.com

3. **Data Security**: Banking information is stored in plain text in the current implementation. Consider additional security measures for production use.

## Rollback Plan

If issues are found:
1. Keep using the current `main` branch deployment
2. Fix issues on feature branch
3. Re-test before merging

The live form at https://prestigelaborsolutions.com/freelancerapplication/ will continue using the current version until the feature branch is merged to main.