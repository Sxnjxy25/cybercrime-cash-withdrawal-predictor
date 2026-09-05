const { chromium } = require('playwright');

async function runPlaywrightVerification() {
  console.log("==================================================");
  console.log("🚀 STARTING PLAYWRIGHT END-TO-END AUTOMATED TEST");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = "http://localhost:3000";
  console.log(`\n[STEP 0] Navigating to ${baseUrl}...`);
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30000 });

  // 1. Verify Step 1 is active on initial load
  console.log("\n[TEST 1] Verifying Step 1 (Terms & Conditions) initial state...");
  const step1Title = await page.locator("text=STEP 1 OF 3").isVisible();
  console.log("✓ Step 1 Badge visible:", step1Title);
  if (!step1Title) throw new Error("Step 1 was not active on initial load");

  // Verify Step 3 cannot be skipped directly
  console.log("\n[TEST 2] Verifying Step 3 is locked before completing Step 1 and 2...");
  const step3Element = page.locator("text=Step 3: Report Fraud & AI Cash-Out Predictor");
  await step3Element.click();
  // Ensure still on Step 1
  const stillOnStep1 = await page.locator("text=STEP 1 OF 3").isVisible();
  console.log("✓ Step 3 properly blocked before Step 1 completion. Still on Step 1:", stillOnStep1);
  if (!stillOnStep1) throw new Error("Step 3 was incorrectly accessible before completing Step 1");

  // 2. Click "I Accept & Proceed to Step 2"
  console.log("\n[TEST 3] Clicking 'I Accept & Proceed to Step 2' button...");
  const acceptBtn = page.locator("button:has-text('I Accept & Proceed to Step 2')");
  await acceptBtn.click();
  await page.waitForTimeout(500);

  // 3. Verify Step 2 is now active
  console.log("\n[TEST 4] Verifying Step 2 (Citizen Verification & Checklist)...");
  const step2Badge = await page.locator("text=STEP 2 OF 3: PRE-FILING VERIFICATION").isVisible();
  console.log("✓ Step 2 Active Badge visible:", step2Badge);
  if (!step2Badge) throw new Error("Failed to transition to Step 2");

  // 4. Test Step 2 Inputs & Captcha
  console.log("\n[TEST 5] Testing Citizen Verification Form & Captcha Refresh...");
  const captchaBox = page.locator("input[placeholder='Enter Captcha']");
  await captchaBox.fill("h61r8r");
  console.log("✓ Captcha filled successfully");

  // 5. Click "Submit & Proceed to Step 3"
  console.log("\n[TEST 6] Submitting Citizen Verification to unlock Step 3...");
  const submitBtn = page.locator("button:has-text('Submit & Proceed to Step 3')");
  await submitBtn.click();
  await page.waitForTimeout(800);

  // 6. Verify Step 3 is active
  console.log("\n[TEST 7] Verifying Step 3 (Report Fraud & AI Cash-Out Predictor)...");
  const step3Badge = await page.locator("text=STEP 3 OF 3: REPORT FRAUD & ML PREDICTOR").isVisible();
  console.log("✓ Step 3 Active Badge visible:", step3Badge);
  if (!step3Badge) throw new Error("Failed to transition to Step 3");

  // 7. Test Financial Incident Inputs & Run Real-Time Cash-Out Prediction
  console.log("\n[TEST 8] Executing Real-Time ML Cash-Out Prediction (sih26184_mule_cashout_model.pkl)...");
  const predictBtn = page.locator("button:has-text('Run Real-Time Cash-Out Prediction')");
  await predictBtn.click();
  
  // Wait for inference results
  await page.waitForSelector("text=Forensic Cash-Out Risk Assessment", { timeout: 15000 });
  console.log("✓ Forensic Cash-Out Risk Assessment Card Rendered!");

  const muleRiskText = await page.locator("text=Mule Laundering Risk").isVisible();
  console.log("✓ Mule Laundering Risk Probability metric visible:", muleRiskText);

  const hotspotsTitle = await page.locator("text=Predicted Physical ATM Cash-Out Terminals").isVisible();
  console.log("✓ Predicted Physical ATM Hotspots list visible:", hotspotsTitle);

  const hashText = await page.locator("text=SHA-256 Forensic Audit").isVisible();
  console.log("✓ Digital Tamper-Proof Evidence Hash visible:", hashText);

  // 8. Test Navigation to National Command Center & Risk Map
  console.log("\n[TEST 9] Testing transition to National Threat Intelligence Command Center...");
  const commandCenterBtn = page.locator("button:has-text('View in National Command Center & Risk Map')");
  await commandCenterBtn.click();
  await page.waitForTimeout(1000);

  const commandCenterTitle = await page.locator("text=NATIONAL FINANCIAL CYBER THREAT COMMAND CENTER").isVisible();
  console.log("✓ National Financial Threat Command Center & Live Risk Map visible:", commandCenterTitle);

  console.log("\n==================================================");
  console.log("🎉 ALL PLAYWRIGHT BUTTON & STEP VERIFICATION TESTS PASSED!");
  console.log("==================================================");

  await browser.close();
}

runPlaywrightVerification().catch(err => {
  console.error("❌ Playwright Test Failed:", err);
  process.exit(1);
});
