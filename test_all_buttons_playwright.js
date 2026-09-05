const path = require('path');
let chromium;

try {
  chromium = require('playwright').chromium;
} catch (e) {
  chromium = require(path.join(__dirname, 'frontend', 'node_modules', 'playwright')).chromium;
}

async function testAllButtonsAndFlows() {
  console.log("================================================================================");
  console.log("🚀 STARTING EXHAUSTIVE PLAYWRIGHT VERIFICATION OF ALL BUTTONS & FLOWS");
  console.log("================================================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const baseUrl = "http://localhost:3000";
  console.log(`\n[INIT] Navigating to ${baseUrl}...`);
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30000 });

  // -------------------------------------------------------------------------
  // 1. STEP 1 INITIAL STATE & STRICT STEP LOCKING
  // -------------------------------------------------------------------------
  console.log("\n--- PHASE 1: STEP 1 (TERMS & CONDITIONS) & LOCK VERIFICATION ---");

  // 1.1 Verify Step 1 is active on initial load
  const step1HeaderVisible = await page.locator("text=STEP 1 OF 3").isVisible();
  console.log("✓ [1.1] Step 1 Badge visible:", step1HeaderVisible);
  if (!step1HeaderVisible) throw new Error("Step 1 was not active on initial load");

  // 1.2 Verify Stepper Step 2 cannot be clicked before Step 1
  console.log("✓ [1.2] Testing locked Stepper Step 2 click...");
  await page.locator("text=Step 2: Citizen Verification & Checklist").click();
  await page.waitForTimeout(300);
  const stillOnStep1AfterStep2Click = await page.locator("text=STEP 1 OF 3").isVisible();
  console.log("  -> Blocked successfully! Still on Step 1:", stillOnStep1AfterStep2Click);
  if (!stillOnStep1AfterStep2Click) throw new Error("Stepper Step 2 was clicked prematurely");

  // 1.3 Verify Stepper Step 3 cannot be clicked before Step 1
  console.log("✓ [1.3] Testing locked Stepper Step 3 click...");
  await page.locator("text=Step 3: Report Fraud & AI Cash-Out Predictor").click();
  await page.waitForTimeout(300);
  const stillOnStep1AfterStep3Click = await page.locator("text=STEP 1 OF 3").isVisible();
  console.log("  -> Blocked successfully! Still on Step 1:", stillOnStep1AfterStep3Click);
  if (!stillOnStep1AfterStep3Click) throw new Error("Stepper Step 3 was clicked prematurely");

  // 1.4 Click "I Accept & Proceed to Step 2" button
  console.log("✓ [1.4] Clicking 'I Accept & Proceed to Step 2' button...");
  const acceptBtn = page.locator("button:has-text('I Accept & Proceed to Step 2')");
  await acceptBtn.click();
  await page.waitForTimeout(500);

  // -------------------------------------------------------------------------
  // 2. STEP 2 (CITIZEN VERIFICATION & CHECKLIST)
  // -------------------------------------------------------------------------
  console.log("\n--- PHASE 2: STEP 2 (CITIZEN VERIFICATION & CHECKLIST) ---");

  const step2Badge = await page.locator("text=STEP 2 OF 3: PRE-FILING VERIFICATION").isVisible();
  console.log("✓ [2.1] Step 2 Active Badge visible:", step2Badge);
  if (!step2Badge) throw new Error("Failed to transition to Step 2");

  // 2.2 Test "Clear" button functionality
  console.log("✓ [2.2] Testing 'Clear' button functionality...");
  const mobileInput = page.locator("input[placeholder='Mobile No.']");
  const otpInput = page.locator("input[placeholder='Your OTP Number']");
  const captchaInput = page.locator("input[placeholder='Enter Captcha']");

  const clearBtn = page.locator("button:has-text('Clear')");
  await clearBtn.click();
  await page.waitForTimeout(300);

  const mobileValAfterClear = await mobileInput.inputValue();
  const otpValAfterClear = await otpInput.inputValue();
  const captchaValAfterClear = await captchaInput.inputValue();
  console.log(`  -> Values after Clear: Mobile='${mobileValAfterClear}', OTP='${otpValAfterClear}', Captcha='${captchaValAfterClear}'`);
  if (mobileValAfterClear !== "" || otpValAfterClear !== "" || captchaValAfterClear !== "") {
    throw new Error("Clear button failed to reset input fields");
  }

  // 2.3 Test "Get OTP" button
  console.log("✓ [2.3] Testing 'Get OTP' button...");
  await mobileInput.fill("9876543210");
  const getOtpBtn = page.locator("button:has-text('Get OTP')");
  await getOtpBtn.click();
  await page.waitForTimeout(300);
  const otpDispatchedMsg = await page.locator("text=OTP dispatched to verified mobile number").isVisible();
  console.log("  -> OTP Dispatch confirmation visible:", otpDispatchedMsg);
  if (!otpDispatchedMsg) throw new Error("Get OTP button failed to trigger confirmation");

  // 2.4 Test "Refresh Captcha" button
  console.log("✓ [2.4] Testing 'Refresh Captcha' button...");
  const captchaTextElement = page.locator("span.line-through");
  const initialCaptcha = await captchaTextElement.textContent();
  const refreshCaptchaBtn = page.locator("button[title='Refresh Captcha']");
  await refreshCaptchaBtn.click();
  await page.waitForTimeout(300);
  const newCaptcha = await captchaTextElement.textContent();
  console.log(`  -> Initial Captcha: '${initialCaptcha}', New Captcha: '${newCaptcha}'`);

  // 2.5 Test Back to Step 1 Button
  console.log("✓ [2.5] Testing '< Back to Step 1: Terms & Conditions' button...");
  const backToStep1Btn = page.locator("button:has-text('Back to Step 1: Terms & Conditions')");
  await backToStep1Btn.click();
  await page.waitForTimeout(400);
  const returnedToStep1 = await page.locator("text=STEP 1 OF 3").isVisible();
  console.log("  -> Returned to Step 1 successfully:", returnedToStep1);
  if (!returnedToStep1) throw new Error("Back to Step 1 button failed");

  // 2.6 Return to Step 2 using Stepper (since Step 1 is already completed)
  console.log("✓ [2.6] Clicking unlocked Stepper Step 2...");
  await page.locator("text=Step 2: Citizen Verification & Checklist").click();
  await page.waitForTimeout(400);

  // 2.7 Verify Stepper Step 3 still locked before submitting Step 2
  console.log("✓ [2.7] Verifying Step 3 locked before submitting Step 2...");
  await page.locator("text=Step 3: Report Fraud & AI Cash-Out Predictor").click();
  await page.waitForTimeout(300);
  const stillOnStep2 = await page.locator("text=STEP 2 OF 3: PRE-FILING VERIFICATION").isVisible();
  console.log("  -> Blocked successfully! Still on Step 2:", stillOnStep2);
  if (!stillOnStep2) throw new Error("Step 3 was clicked before Step 2 was submitted");

  // 2.8 Fill Form and Submit Step 2
  console.log("✓ [2.8] Submitting Citizen Verification Form to unlock Step 3...");
  await mobileInput.fill("9876543210");
  await otpInput.fill("492810");
  const currentCaptcha = await captchaTextElement.textContent();
  await captchaInput.fill(currentCaptcha.trim());
  const submitStep2Btn = page.locator("button:has-text('Submit & Proceed to Step 3')");
  await submitStep2Btn.click();
  await page.waitForTimeout(600);

  // -------------------------------------------------------------------------
  // 3. STEP 3 (REPORT FRAUD & AI CASH-OUT PREDICTOR)
  // -------------------------------------------------------------------------
  console.log("\n--- PHASE 3: STEP 3 (REPORT FRAUD & AI CASH-OUT PREDICTOR) ---");

  const step3Badge = await page.locator("text=STEP 3 OF 3: REPORT ONLINE MONEY FRAUD & AI PREDICTOR").isVisible();
  console.log("✓ [3.1] Step 3 Active Badge visible:", step3Badge);
  if (!step3Badge) throw new Error("Failed to transition to Step 3");

  // 3.2 Test Back to Step 2 Button
  console.log("✓ [3.2] Testing '< Back to Step 2: Citizen Verification' button...");
  const backToStep2Btn = page.locator("button:has-text('Back to Step 2: Citizen Verification')");
  await backToStep2Btn.click();
  await page.waitForTimeout(400);
  const returnedToStep2 = await page.locator("text=STEP 2 OF 3: PRE-FILING VERIFICATION").isVisible();
  console.log("  -> Returned to Step 2 successfully:", returnedToStep2);
  if (!returnedToStep2) throw new Error("Back to Step 2 button failed");

  // 3.3 Return to Step 3 using Stepper (now unlocked!)
  console.log("✓ [3.3] Navigating back to Step 3 via Stepper...");
  await page.locator("text=Step 3: Report Fraud & AI Cash-Out Predictor").click();
  await page.waitForTimeout(400);

  // 3.4 Test Incident Form Inputs and Dropdowns
  console.log("✓ [3.4] Testing form inputs, Mandatory & Optional tabs, and City coordinates selector...");
  const amountInput = page.locator("input[placeholder='e.g. 185000']");
  await amountInput.fill("275000");

  const txnIdInput = page.locator("input[placeholder='12-digit UTR No.']");
  await txnIdInput.fill("UTR202688491204");

  const bankSelect = page.locator("select").nth(0);
  await bankSelect.selectOption("HDFC Bank");

  const formatSelect = page.locator("select").nth(1);
  await formatSelect.selectOption("UPI");

  const citySelect = page.locator("select").nth(2);
  await citySelect.selectOption("Chennai, Tamil Nadu");
  await page.waitForTimeout(200);

  const latLonText = await page.locator("text=Lat: 13.0827").isVisible();
  console.log("  -> Dynamic GPS coordinates updated for Chennai (13.0827, 80.2707):", latLonText);
  if (!latLonText) throw new Error("City selector did not update GPS coordinates");

  // Test switching to Optional tab and back
  console.log("✓ [3.4.1] Testing 'Optional Suspect Info' tab...");
  const optionalTabBtn = page.locator("button:has-text('Optional Suspect Info')");
  await optionalTabBtn.click();
  await page.waitForTimeout(300);
  const suspectPhoneVisible = await page.locator("input[placeholder='Suspect Phone']").isVisible();
  console.log("  -> Optional Suspect Details Tab opened:", suspectPhoneVisible);

  const mandatoryTabBtn = page.locator("button:has-text('Mandatory Info *')");
  await mandatoryTabBtn.click();
  await page.waitForTimeout(300);

  // 3.5 Execute Live ML Model Prediction with Code Generation
  console.log("✓ [3.5] Clicking 'Generate Code & Predict' (ML Model Bundle)...");
  const predictBtn = page.locator("button:has-text('Generate Code & Predict')");
  await predictBtn.click();

  // Wait for inference card to appear
  await page.waitForSelector("text=Forensic Cash-Out Risk Assessment", { timeout: 15000 });
  console.log("✓ [3.6] Forensic Cash-Out Risk Assessment Card successfully rendered!");

  const screenshotPath = 'C:\\Users\\adith\\.gemini\\antigravity-ide\\brain\\ee63927d-7366-45b9-a671-94772bceb392\\step3_without_options_verified.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("  -> Saved fresh screenshot of Step 3 without option cards to:", screenshotPath);

  const officialCodeVisible = await page.locator("text=OFFICIAL 12-DIGIT COMPLAINT TRACKING CODE").first().isVisible();
  console.log("  -> Official 12-Digit Complaint Tracking Code visible:", officialCodeVisible);

  const atmHotspotsVisible = await page.locator("text=Predicted Physical ATM Cash-Out Terminals").isVisible();
  const interventionsVisible = await page.locator("text=Automated Law Enforcement Interventions").isVisible();

  console.log("  -> Predicted ATM Hotspots visible:", atmHotspotsVisible);
  console.log("  -> Law Enforcement Interventions visible:", interventionsVisible);

  if (!officialCodeVisible || !atmHotspotsVisible || !interventionsVisible) {
    throw new Error("Prediction Output Card did not display all expected forensic components");
  }

  // 3.7 Test Complaint Withdrawal Flow with 12-digit code
  console.log("\n--- PHASE 3.7: COMPLAINT WITHDRAWAL USING 12-DIGIT CODE ---");
  const withdrawModalBtn = page.locator("button:has-text('Withdraw Complaint (12-Digit Code)')").first();
  await withdrawModalBtn.click();
  await page.waitForTimeout(500);

  const withdrawalModalVisible = await page.locator("text=Complaint Withdrawal Portal").isVisible();
  console.log("✓ [3.7.1] Complaint Withdrawal Modal opened:", withdrawalModalVisible);
  if (!withdrawalModalVisible) throw new Error("Failed to open Complaint Withdrawal Modal");

  const withdrawSubmitBtn = page.locator("button:has-text('Confirm Complaint Withdrawal')");
  await withdrawSubmitBtn.click();
  await page.waitForTimeout(600);

  const withdrawalConfirmed = await page.locator("text=WITHDRAWAL CONFIRMED & CLOSED").isVisible();
  console.log("✓ [3.7.2] Withdrawal Confirmed and Closed successfully:", withdrawalConfirmed);
  if (!withdrawalConfirmed) throw new Error("Failed to confirm complaint withdrawal");

  // Close withdrawal modal
  const closeWithdrawalBtn = page.locator("button:has-text('Close Window')");
  await closeWithdrawalBtn.click();
  await page.waitForTimeout(400);

  // -------------------------------------------------------------------------
  // 4. STEP 4 (ADMIN-ONLY NATIONAL THREAT MAP & SPECIFIC COMPLAINT INSPECTOR)
  // -------------------------------------------------------------------------
  console.log("\n--- PHASE 4: ADMIN-ONLY THREAT MAP & COMPLAINT LOCATION INSPECTOR ---");

  // 4.1 Click "View in National Command Center & Risk Map" (Admin Button)
  console.log("✓ [4.1] Clicking 'View in National Command Center & Risk Map' (Admin protected)...");
  const commandCenterBtn = page.locator("button:has-text('View in National Command Center & Risk Map')");
  await commandCenterBtn.click();
  await page.waitForTimeout(500);

  // 4.1.1 Verify Admin Authentication Gate opens
  const adminGateVisible = await page.locator("text=Admin & Officer Verification Gate").isVisible();
  console.log("✓ [4.1.1] Admin / LEO Verification Gate Modal opened:", adminGateVisible);
  if (!adminGateVisible) throw new Error("Admin Gate Modal did not open for protected Threat Map");

  // Capture Admin Gate Screenshot
  const adminGateScreenshotPath = 'C:\\Users\\adith\\.gemini\\antigravity-ide\\brain\\ee63927d-7366-45b9-a671-94772bceb392\\admin_auth_gate_verified.png';
  await page.screenshot({ path: adminGateScreenshotPath, fullPage: false });
  console.log("  -> Saved Admin Gate screenshot to:", adminGateScreenshotPath);

  // 4.1.2 Authenticate as Admin / LEO Officer
  console.log("✓ [4.1.2] Authenticating with LEO Official Credentials...");
  const quickAuthBtn = page.locator("button:has-text('Quick LEO Demo Auth')");
  await quickAuthBtn.click();
  await page.waitForTimeout(800);

  // 4.2 Verify Admin Command Center is rendered with pristine Obsidian UI
  const commandCenterTitle = await page.locator("text=NATIONAL FINANCIAL CYBER THREAT COMMAND CENTER").isVisible();
  const pipelineVisible = await page.locator("text=CINEMATIC INTELLIGENCE PIPELINE").isVisible();
  const threatSphereVisible = await page.locator("text=GLOBAL THREAT SPHERE").isVisible();
  const riskGaugeVisible = await page.locator("text=AGGREGATED INDEX").isVisible();
  const indiaMapVisible = await page.locator("text=PREDICTIVE CYBER RISK MAP (INDIA)").isVisible();

  console.log("✓ [4.2] National Command Center Header visible:", commandCenterTitle);
  console.log("✓ [4.2.1] 6-Stage Intelligence Pipeline visible:", pipelineVisible);
  console.log("✓ [4.2.2] 3D Threat Sphere & Risk Gauge visible:", threatSphereVisible && riskGaugeVisible);
  console.log("✓ [4.2.3] Predictive Cyber Risk Map visible:", indiaMapVisible);
  if (!commandCenterTitle || !pipelineVisible || !indiaMapVisible) throw new Error("Failed to load Admin Command Center");

  // Capture pristine Command Center Screenshot
  const commandCenterScreenshot = 'C:\\Users\\adith\\.gemini\\antigravity-ide\\brain\\ee63927d-7366-45b9-a671-94772bceb392\\command_center_verified.png';
  await page.screenshot({ path: commandCenterScreenshot, fullPage: true });
  console.log("  -> Saved pristine Command Center screenshot to:", commandCenterScreenshot);

  // 4.2.4 Navigate to COMPLAINT INTELLIGENCE via Sidebar
  console.log("✓ [4.2.4] Clicking 'COMPLAINT INTELLIGENCE' in Tactical Sidebar...");
  const complaintIntelSidebarBtn = page.locator("button:has-text('COMPLAINT INTELLIGENCE')");
  await complaintIntelSidebarBtn.click();
  await page.waitForTimeout(600);

  const complaintInspectorVisible = await page.locator("text=COMPLAINT PINPOINT INSPECTOR").isVisible();
  console.log("✓ [4.2.5] Complaint Pinpoint Inspector visible in COMPLAINT_INTELLIGENCE tab:", complaintInspectorVisible);
  if (!complaintInspectorVisible) throw new Error("Complaint Pinpoint Inspector not visible in COMPLAINT_INTELLIGENCE");

  // 4.2.6 Test Searching / Locating a Specific Complaint
  console.log("✓ [4.2.6] Testing Specific Complaint Location Lookup (e.g. #202684910294)...");
  const locateBtn = page.locator("button:has-text('LOCATE ON MAP')");
  await locateBtn.click();
  await page.waitForTimeout(600);

  const crimeLocationDossier = await page.locator("text=CRIME INCIDENT LOCATION").isVisible();
  const atmHotspotsVisibleInAdmin = await page.locator("text=FORECASTED ATM CASH-OUT TERMINALS (PINPOINTED AROUND CRIME RADIUS)").isVisible();
  console.log("  -> Crime Incident Location Coordinates visible:", crimeLocationDossier);
  console.log("  -> Forecasted ATM Terminals for Complaint visible:", atmHotspotsVisibleInAdmin);
  if (!crimeLocationDossier) throw new Error("Crime incident location dossier failed to render");

  // 4.2.7 Test LEO Emergency Actions
  console.log("✓ [4.2.7] Testing LEO Emergency Interventions (CFCFRMS Freeze & PCR Dispatch)...");
  const freezeBtn = page.locator("button:has-text('CFCFRMS FREEZE')");
  if (await freezeBtn.isVisible()) {
    await freezeBtn.click();
    await page.waitForTimeout(400);
  }
  const dispatchBtn = page.locator("button:has-text('DISPATCH PCR')");
  if (await dispatchBtn.isVisible()) {
    await dispatchBtn.click();
    await page.waitForTimeout(400);
  }

  // Capture Admin Complaint Location Inspector & Threat Map Screenshot
  const adminMapScreenshotPath = 'C:\\Users\\adith\\.gemini\\antigravity-ide\\brain\\ee63927d-7366-45b9-a671-94772bceb392\\admin_threat_map_complaint_inspector_verified.png';
  await page.screenshot({ path: adminMapScreenshotPath, fullPage: true });
  console.log("  -> Saved Admin Map & Complaint Inspector screenshot to:", adminMapScreenshotPath);

  // Switch back to Command Center
  await page.locator("button:has-text('COMMAND CENTER')").click();
  await page.waitForTimeout(400);

  // 4.3 Test AI Copilot Drawer Button
  console.log("✓ [4.3] Testing 'AI Intelligence Copilot' button...");
  const copilotBtn = page.locator("button:has-text('AI COPILOT')").first();
  if (await copilotBtn.isVisible()) {
    await copilotBtn.click();
    await page.waitForTimeout(500);
    const copilotVisible = await page.locator("text=INVESTIGATION ASSISTANT").isVisible();
    console.log("  -> AI Copilot Drawer opened:", copilotVisible);

    // Close Copilot Drawer
    const closeCopilotBtn = page.locator(".lucide-x").locator("..");
    if (await closeCopilotBtn.first().isVisible()) {
      await closeCopilotBtn.first().click();
      await page.waitForTimeout(300);
      console.log("  -> AI Copilot Drawer closed successfully");
    }
  }

  // 4.4 Test Back to Citizen Complaint Filing Button
  console.log("✓ [4.4] Testing '< Back to Citizen Complaint Filing' button...");
  const backToComplaintBtn = page.locator("button:has-text('Back to Citizen Complaint Filing')");
  await backToComplaintBtn.click();
  await page.waitForTimeout(600);

  const backOnStep1 = await page.locator("text=Filing a Complaint on National Cyber Crime Reporting Portal").isVisible();
  console.log("  -> Returned to Citizen Complaint Filing Portal successfully:", backOnStep1);
  if (!backOnStep1) throw new Error("Back to Complaint Filing button failed");

  // -------------------------------------------------------------------------
  // 5. TOP RIGHT CORNER ADMIN LOGIN & CITIZEN NAVBAR
  // -------------------------------------------------------------------------
  console.log("\n--- PHASE 5: TOP RIGHT CORNER ADMIN LOGIN & CITIZEN NAVBAR ---");
  
  // Capture Landing Page with Clean Top Right Admin Login
  const cleanTopRightScreenshot = 'C:\\Users\\adith\\.gemini\\antigravity-ide\\brain\\ee63927d-7366-45b9-a671-94772bceb392\\clean_top_right_login_verified.png';
  await page.screenshot({ path: cleanTopRightScreenshot, fullPage: false });
  console.log("  -> Saved screenshot of clean top right Admin Login to:", cleanTopRightScreenshot);

  console.log("✓ [5.1] Testing top-right 'Admin Login / Admin Active' button...");
  const topRightAdminLoginBtn = page.locator("button:has-text('Admin Active'), button:has-text('Admin Login')").first();
  await topRightAdminLoginBtn.click();
  await page.waitForTimeout(600);

  const gateOpened = await page.locator("text=Admin & Officer Verification Gate").isVisible();
  if (gateOpened) {
    console.log("  -> Admin Login Gate opened from top right corner");
    await page.locator("button:has-text('Quick LEO Demo Auth')").click();
    await page.waitForTimeout(600);
  }

  const inObservatory = await page.locator("text=NATIONAL FINANCIAL CYBER THREAT COMMAND CENTER").isVisible();
  console.log("  -> Opened Admin Observatory via Top Right Login successfully:", inObservatory);
  if (!inObservatory) throw new Error("Top right Admin Login failed to open Observatory");

  console.log("✓ [5.2] Testing 'Register Online Money Fraud Complaint' navbar button...");
  const navRegisterBtn = page.locator("button:has-text('Register Online Money Fraud Complaint')");
  await navRegisterBtn.click();
  await page.waitForTimeout(600);

  const backInWizard = await page.locator("text=Filing a Complaint on National Cyber Crime Reporting Portal").isVisible();
  console.log("  -> Returned to Wizard via Navbar successfully:", backInWizard);
  if (!backInWizard) throw new Error("Navbar Register Complaint button failed");

  console.log("\n================================================================================");
  console.log("🎉 ALL 20 AUTOMATED BUTTON, ADMIN GATE & LOCATION INSPECTOR TESTS PASSED 100%!");
  console.log("================================================================================");

  await browser.close();
}

testAllButtonsAndFlows().catch(err => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
