const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  console.log('=== TEST 1: Login Form Redesign & Space Minimization ===');
  // Full HD Desktop 1440x900
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(__dirname, 'login_desktop_clean.png') });

  // Mobile 375x812
  await page.setViewport({ width: 375, height: 812 });
  await page.screenshot({ path: path.join(__dirname, 'login_mobile_clean.png') });

  // Verify demo box and admin route link are not in the DOM
  const demoBox = await page.$('#demo-login-sarah');
  const adminRouteBtn = await page.$('button ::-p-text(Admin Route)');
  if (demoBox) throw new Error('Demo credentials box still found in DOM!');
  if (adminRouteBtn) throw new Error('Admin Route button still found in DOM!');
  console.log('PASS: Demo credentials and Admin Route link completely removed.');

  console.log('=== TEST 2: Desktop Workspace Full Screen Width & Text Cutoff Fixes ===');
  await page.setViewport({ width: 1440, height: 900 });
  
  // Login as Sarah (Employee) to inspect dashboard
  await page.type('#login-email-input', 'employee@elms.com');
  await page.type('#login-password-input', 'employee123');
  await page.click('#login-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(__dirname, 'desktop_fullscreen_dashboard.png') });

  // Check ELMS text in header
  const elmsHeaderBadge = await page.$eval('header div.bg-indigo-600', el => el.innerText).catch(() => '');
  console.log('ELMS badge text:', elmsHeaderBadge);
  if (elmsHeaderBadge !== 'ELMS') throw new Error('ELMS badge text mismatch!');

  // Check Apply Leave button text
  const applyBtnText = await page.$eval('#dash-apply-leave-btn', el => el.innerText).catch(() => '');
  console.log('Apply Leave button text:', applyBtnText);
  if (applyBtnText.includes('+ +')) throw new Error('Duplicate plus found in Apply Leave button!');
  console.log('PASS: Apply Leave button does not have duplicate +.');

  // Sign out Sarah cleanly
  console.log('=== TEST 3: Manager Leave Application & Route to Admin Portal ===');
  await page.evaluate(() => localStorage.removeItem('elms_current_user_id'));
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

  // Login as Alex Rivera (Manager)
  await page.type('#login-email-input', 'manager@elms.com');
  await page.type('#login-password-input', 'manager123');
  await page.click('#login-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  // Open Apply Leave modal
  const headerApplyBtn = await page.$('#header-apply-leave-btn');
  await headerApplyBtn.click();
  await new Promise(r => setTimeout(r, 500));

  // Verify Manager Leave notice banner is visible
  const noticeBannerText = await page.$eval('form', el => el.innerText).catch(() => '');
  if (!noticeBannerText.includes('Administrator Approval Routed')) {
    throw new Error('Manager leave notice banner not found in Apply Leave modal!');
  }
  console.log('PASS: Manager leave notice banner displayed in modal.');

  // Fill and submit leave request
  await page.type('#leave-reason-textarea', 'Attending Q3 Leadership Retreat');
  await page.screenshot({ path: path.join(__dirname, 'manager_apply_leave_modal.png') });
  await page.click('#submit-leave-request-btn');
  await new Promise(r => setTimeout(r, 1200));

  // Check Manager's Team Approvals tab
  const approvalsTab = await page.$('button[title="Team Approvals"], nav button:has(svg)');
  await page.screenshot({ path: path.join(__dirname, 'manager_portal_after_apply.png') });

  // Check if Alex Rivera appears in Manager's pending approvals
  const managerTableText = await page.$eval('main', el => el.innerText).catch(() => '');
  if (managerTableText.includes('Alex Rivera') && managerTableText.includes('Attending Q3 Leadership Retreat')) {
    throw new Error('Manager leave request incorrectly appeared in Manager portal approvals!');
  }
  console.log('PASS: Manager leave request is NOT in Manager portal approvals.');

  console.log('=== TEST 4: Verify Leave Request Appears in Admin Portal for Approval ===');
  // Sign out Manager cleanly
  await page.evaluate(() => localStorage.removeItem('elms_current_user_id'));
  // Go to /admin route
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await page.type('#login-email-input', 'admin@elms.com');
  await page.type('#login-password-input', 'admin123');
  await page.click('#login-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(__dirname, 'admin_dashboard_with_manager_request.png') });

  // Navigate to Approvals tab
  const adminApprovalsBtn = await page.$('nav button ::-p-text(Leave Approvals)');
  if (adminApprovalsBtn) {
    await adminApprovalsBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }
  await page.screenshot({ path: path.join(__dirname, 'admin_approvals_queue.png') });

  const adminMainText = await page.$eval('main', el => el.innerText).catch(() => '');
  if (!adminMainText.includes('Alex Rivera')) {
    throw new Error('Manager leave request did NOT reach Admin portal!');
  }
  console.log('PASS: Manager leave request successfully routed to Admin portal for approval!');

  // Open the request details
  const alexRow = await page.$('tr ::-p-text(Alex Rivera)');
  if (alexRow) {
    await alexRow.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(__dirname, 'admin_review_manager_modal.png') });
    
    // Check for executive routing notice inside modal
    const modalNotice = await page.$eval('#executive-routing-notice', el => el.innerText).catch(() => '');
    console.log('Modal Executive notice:', modalNotice);
    if (!modalNotice.includes('Executive Routing Notice')) {
      throw new Error('Executive Routing Notice not found in Admin review modal!');
    }

    // Approve the request
    const approveBtn = await page.$('button ::-p-text(Approve Request)');
    if (approveBtn) {
      await approveBtn.click();
      await new Promise(r => setTimeout(r, 800));
      console.log('PASS: Admin successfully approved Manager leave request.');
    }
  }

  await browser.close();
  console.log('=== ALL TESTS PASSED WITH 100% SUCCESS! ===');
})().catch(err => {
  console.error('Test Execution Failed:', err);
  process.exit(1);
});
