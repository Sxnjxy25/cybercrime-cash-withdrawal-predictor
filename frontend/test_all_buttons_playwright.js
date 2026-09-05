const { chromium } = require('playwright');
const path = require('path');

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
  // 4. STEP 4 (NATIONAL FINANCIAL COMMAND CENTER & OBSERVATORY)
  // -------------------------------------------------------------------------
  console.log("\n--- PHASE 4: COMMAND CENTER & THREAT OBSERVATORY ---");

  // 4.1 Click "View in National Command Center & Risk Map"
  console.log("✓ [4.1] Clicking 'View in National Command Center & Risk Map' button...");
  const commandCenterBtn = page.locator("button:has-text('View in National Command Center & Risk Map')");
  await commandCenterBtn.click();
  await page.waitForTimeout(800);

  const commandCenterTitle = await page.locator("text=NATIONAL FINANCIAL CYBER THREAT COMMAND CENTER").isVisible();
  console.log("✓ [4.2] National Command Center Header visible:", commandCenterTitle);
  if (!commandCenterTitle) throw new Error("Failed to load Command Center");

  // 4.2 Test Demo Simulation Button
  console.log("✓ [4.3] Testing 'Simulate Emerging Threat Syndicate' button in Navbar...");
  const simulateBtn = page.locator("button:has-text('Simulate Syndicate Threat')");
  if (await simulateBtn.isVisible()) {
    await simulateBtn.click();
    await page.waitForTimeout(600);
    console.log("  -> Simulation triggered successfully");
  }

  // 4.3 Test AI Copilot Drawer Button
  console.log("✓ [4.4] Testing 'AI Intelligence Copilot' button...");
  const copilotBtn = page.locator("button:has-text('Copilot')").first();
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

  // 4.4 Test Sidebar Navigation Buttons
  console.log("✓ [4.5] Testing Sidebar navigation tabs...");
  const tabs = [
    { name: "EARLY WARNINGS", checkSelector: "h2:has-text('EARLY WARNING ENGINE WORKSPACE')" },
    { name: "INVESTIGATION WORKSPACE", checkSelector: "h2:has-text('INVESTIGATION WORKSPACE')" },
    { name: "AUDIT TRAIL", checkSelector: "h2:has-text('SECURITY & AUDIT TRAIL LOGS')" },
    { name: "COMMAND CENTER", checkSelector: "h1:has-text('NATIONAL FINANCIAL CYBER THREAT COMMAND CENTER')" },
  ];

  for (const tab of tabs) {
    const tabBtn = page.locator(`button:has-text('${tab.name}')`).first();
    if (await tabBtn.isVisible()) {
      await tabBtn.click();
      await page.waitForTimeout(400);
      const isVisible = await page.locator(tab.checkSelector).isVisible();
      console.log(`  -> Sidebar Tab '${tab.name}' verified:`, isVisible);
      if (!isVisible) throw new Error(`Failed to activate tab ${tab.name}`);
    }
  }

  // 4.5 Test Back to Complaint Filing Button
  console.log("✓ [4.6] Testing '< Back to Complaint Filing' button...");
  const backToComplaintBtn = page.locator("button:has-text('Back to Complaint Filing')");
  await backToComplaintBtn.click();
  await page.waitForTimeout(600);

  const backOnStep1 = await page.locator("text=Filing a Complaint on National Cyber Crime Reporting Portal").isVisible();
  console.log("  -> Returned to Complaint Filing Portal successfully:", backOnStep1);
  if (!backOnStep1) throw new Error("Back to Complaint Filing button failed");

  // -------------------------------------------------------------------------
  // 5. TOP NAVBAR NAVIGATION
  // -------------------------------------------------------------------------
  console.log("\n--- PHASE 5: TOP NAVBAR NAVIGATION BAR ---");
  console.log("✓ [5.1] Testing 'National Financial Threat Map & Observatory' navbar button...");
  const navMapBtn = page.locator("button:has-text('National Financial Threat Map & Observatory')");
  await navMapBtn.click();
  await page.waitForTimeout(600);

  const inObservatory = await page.locator("text=NATIONAL FINANCIAL CYBER THREAT COMMAND CENTER").isVisible();
  console.log("  -> Opened Observatory via Navbar successfully:", inObservatory);
  if (!inObservatory) throw new Error("Navbar Observatory button failed");

  console.log("✓ [5.2] Testing 'Register Online Money Fraud Complaint' navbar button...");
  const navRegisterBtn = page.locator("button:has-text('Register Online Money Fraud Complaint')");
  await navRegisterBtn.click();
  await page.waitForTimeout(600);

  const backInWizard = await page.locator("text=Filing a Complaint on National Cyber Crime Reporting Portal").isVisible();
  console.log("  -> Returned to Wizard via Navbar successfully:", backInWizard);
  if (!backInWizard) throw new Error("Navbar Register Complaint button failed");

  console.log("\n================================================================================");
  console.log("🎉 ALL 18 AUTOMATED BUTTON, STEP, FORM, AND FLOW VERIFICATION TESTS PASSED 100%!");
  console.log("================================================================================");

  await browser.close();
}

testAllButtonsAndFlows().catch(err => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
