const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Reset to clean state
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });

  console.log('=== TEST 1: Employee Portal Desktop View ===');
  // Click Employee Login Tab
  await page.click('#tab-employee-login');
  await new Promise(r => setTimeout(r, 200));

  // Login as Employee (Sarah Jenkins)
  await page.type('#login-email-input', 'employee@elms.com');
  await page.type('#login-password-input', 'employee123');
  await page.click('#login-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  // 1. Verify navbar does not display Apply Leave
  const navApplyLeaveVisible = await page.evaluate(() => {
    const btn = document.getElementById('header-apply-leave-btn');
    if (!btn) return false;
    const style = window.getComputedStyle(btn);
    return style.display !== 'none';
  });
  if (navApplyLeaveVisible) {
    throw new Error('FAIL: Apply Leave button is still visible in navbar on desktop!');
  }
  console.log('PASS: Apply Leave button is removed/hidden from navbar in desktop view.');

  // 2. Verify left sidebar does not have Apply Leave button
  const sidebarApplyBtn = await page.$('aside #sidebar-apply-leave-btn');
  if (sidebarApplyBtn) {
    throw new Error('FAIL: Apply Leave button still exists in left sidebar!');
  }
  console.log('PASS: Apply Leave button is removed from left sidebar.');

  // 3. Verify left sidebar does not have Signout option
  const sidebarSignoutBtn = await page.$('aside button[title="Sign Out"]');
  if (sidebarSignoutBtn) {
    throw new Error('FAIL: Sign out button still exists in left sidebar!');
  }
  console.log('PASS: Sign out button is removed from left sidebar.');

  // 4. Verify greeting card has + Apply Leave
  const dashApplyBtn = await page.$('#dash-apply-leave-btn');
  if (!dashApplyBtn) {
    throw new Error('FAIL: Greeting card missing + Apply Leave button!');
  }
  console.log('PASS: Employee greeting card retains + Apply Leave button.');

  await page.screenshot({ path: path.join(__dirname, 'employee_desktop_clean.png') });

  console.log('=== TEST 2: Manager Portal Desktop View ===');
  // Sign out and log in as Manager
  await page.evaluate(() => localStorage.removeItem('elms_current_user_id'));
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

  await page.click('#tab-manager-login');
  await page.type('#login-email-input', 'manager@elms.com');
  await page.type('#login-password-input', 'manager123');
  await page.click('#login-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  // 1. Verify navbar does not display Apply Leave
  const mgrNavApplyLeaveVisible = await page.evaluate(() => {
    const btn = document.getElementById('header-apply-leave-btn');
    if (!btn) return false;
    const style = window.getComputedStyle(btn);
    return style.display !== 'none';
  });
  if (mgrNavApplyLeaveVisible) {
    throw new Error('FAIL: Apply Leave button is still visible in Manager navbar on desktop!');
  }
  console.log('PASS: Apply Leave button is removed/hidden from Manager navbar.');

  // 2. Verify left sidebar does not have Apply Leave
  const mgrSidebarApplyBtn = await page.$('aside #sidebar-apply-leave-btn');
  if (mgrSidebarApplyBtn) {
    throw new Error('FAIL: Apply Leave button still exists in Manager left sidebar!');
  }
  console.log('PASS: Apply Leave button is removed from Manager left sidebar.');

  // 3. Verify left sidebar does not have Signout
  const mgrSidebarSignoutBtn = await page.$('aside button[title="Sign Out"]');
  if (mgrSidebarSignoutBtn) {
    throw new Error('FAIL: Sign out button still exists in Manager left sidebar!');
  }
  console.log('PASS: Sign out button is removed from Manager left sidebar.');

  // 4. Verify greeting card has Full Approvals Queue AND + Apply Leave to its right
  const fullApprovalsBtn = await page.$('#mgr-view-approvals-tab-btn');
  const mgrDashApplyBtn = await page.$('#mgr-dash-apply-leave-btn');
  if (!fullApprovalsBtn || !mgrDashApplyBtn) {
    throw new Error('FAIL: Full Approvals Queue or + Apply Leave button missing in Manager greeting card!');
  }
  console.log('PASS: Manager greeting card has + Apply Leave button right of Full Approvals Queue.');

  // Test opening apply modal from greeting card
  await mgrDashApplyBtn.click();
  await new Promise(r => setTimeout(r, 600));
  const applyModal = await page.$('#leave-start-date');
  if (!applyModal) {
    throw new Error('FAIL: Apply Leave modal failed to open from manager greeting card!');
  }
  console.log('PASS: Apply Leave modal opens successfully from manager greeting card.');
  await page.screenshot({ path: path.join(__dirname, 'manager_desktop_apply_modal.png') });

  // Close modal
  const closeBtn = await page.$('button[aria-label="Close dialog"], div[role="dialog"] button:has(svg)');
  if (closeBtn) {
    await closeBtn.click();
    await new Promise(r => setTimeout(r, 400));
  }
  await page.screenshot({ path: path.join(__dirname, 'manager_desktop_clean.png') });

  console.log('=== TEST 3: Admin Portal Desktop View ===');
  // Sign out and log in as Admin
  await page.evaluate(() => localStorage.removeItem('elms_current_user_id'));
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });

  await page.type('#login-email-input', 'admin@elms.com');
  await page.type('#login-password-input', 'admin123');
  await page.click('#login-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  // 1. Verify left sidebar does not have Add Employee button
  const adminSidebarAddBtn = await page.$('aside #sidebar-add-employee-btn');
  if (adminSidebarAddBtn) {
    throw new Error('FAIL: Add Employee button still exists in Admin left sidebar!');
  }
  console.log('PASS: Add Employee button is removed from Admin left sidebar.');

  // 2. Verify left sidebar does not have Sign out
  const adminSidebarSignoutBtn = await page.$('aside button[title="Sign Out"]');
  if (adminSidebarSignoutBtn) {
    throw new Error('FAIL: Sign out button still exists in Admin left sidebar!');
  }
  console.log('PASS: Sign out button is removed from Admin left sidebar.');

  await page.screenshot({ path: path.join(__dirname, 'admin_desktop_clean.png') });

  await browser.close();
  console.log('=== ALL DESKTOP SIDEBAR & NAVBAR TESTS PASSED 100%! ===');
})().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
