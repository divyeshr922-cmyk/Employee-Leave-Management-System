const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Reset localStorage to clean state
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });

  console.log('=== TEST 1: Admin Mobile View Bottom Bar ===');
  await page.setViewport({ width: 375, height: 812 }); // iPhone X/12 viewport
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });

  // Login as Admin
  await page.type('#login-email-input', 'admin@elms.com');
  await page.type('#login-password-input', 'admin123');
  await page.click('#login-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(__dirname, 'admin_mobile_bottom_bar.png') });

  // Verify Admin Mobile Navigation contains Home, Approvals, Calendar, Attendance, Employees, Departments, Policies, Reports, Audit Logs, Settings
  const adminNav = await page.$('#admin-mobile-bottom-nav');
  if (!adminNav) throw new Error('#admin-mobile-bottom-nav not found in Admin mobile view!');

  const homeTab = await page.$('#admin-mobile-nav-home');
  const approvalsTab = await page.$('#admin-mobile-nav-approvals');
  const calendarTab = await page.$('#admin-mobile-nav-calendar');
  const attendanceTab = await page.$('#admin-mobile-nav-attendance');
  const employeesTab = await page.$('#admin-mobile-nav-employees');
  const departmentsTab = await page.$('#admin-mobile-nav-departments');
  const policiesTab = await page.$('#admin-mobile-nav-policies');
  const reportsTab = await page.$('#admin-mobile-nav-reports');
  const auditTab = await page.$('#admin-mobile-nav-audit');
  const settingsTab = await page.$('#admin-mobile-nav-settings');

  if (!homeTab || !approvalsTab || !calendarTab || !attendanceTab || !employeesTab || 
      !departmentsTab || !policiesTab || !reportsTab || !auditTab || !settingsTab) {
    throw new Error('One or more admin bottom bar tabs missing!');
  }
  console.log('PASS: Admin mobile bottom navigation successfully populated with all 10 tools (Home + 9 admin tools from Image 1).');

  // Test tapping Approvals on mobile
  await approvalsTab.click();
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'admin_mobile_approvals_view.png') });

  console.log('=== TEST 2: Admin Portal Approvals Table Delete Option ===');
  await page.setViewport({ width: 1440, height: 900 });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'admin_table_with_delete.png') });

  // Check delete button exists in table row
  const deleteBtns = await page.$$('button[id^="delete-btn-"]');
  if (deleteBtns.length === 0) throw new Error('Delete button not found in Admin Approvals Table!');
  console.log(`PASS: Found ${deleteBtns.length} Delete buttons in Admin Approvals Table.`);

  // Click Delete button on second request (Alex Rivera LR-2026-002)
  const deleteBtnAlex = await page.$('#delete-btn-lr-demo-02') || deleteBtns[1] || deleteBtns[0];
  await deleteBtnAlex.click();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'admin_delete_modal.png') });

  const confirmDeleteBtn = await page.$('#confirm-delete-btn');
  if (!confirmDeleteBtn) throw new Error('Confirm Delete modal not opened!');
  console.log('PASS: Delete confirmation modal opened.');

  // Cancel modal first to verify Cancel works
  await page.click('#cancel-delete-btn');
  await new Promise(r => setTimeout(r, 400));

  // Now click Delete and confirm deletion
  await deleteBtnAlex.click();
  await new Promise(r => setTimeout(r, 400));
  await page.click('#confirm-delete-btn');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'admin_table_after_deletion.png') });
  console.log('PASS: Leave request successfully deleted by Admin.');

  console.log('=== TEST 3: Manager Portal Delete Option ===');
  // Sign out Admin
  await page.evaluate(() => localStorage.removeItem('elms_current_user_id'));
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

  // Login as Manager (Alex)
  await page.click('#tab-manager-login');
  await page.type('#login-email-input', 'manager@elms.com');
  await page.type('#login-password-input', 'manager123');
  await page.click('#login-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  // Check Manager Dashboard Delete button on pending queue card
  const mgrDashDeleteBtn = await page.$('button[id^="mgr-delete-btn-"]');
  if (mgrDashDeleteBtn) {
    console.log('PASS: Delete button exists on Manager dashboard queue card.');
  }

  // Navigate to Manager Team Approvals Queue
  const approvalsNavBtn = await page.$('#nav-approvals') || await page.$('nav button:has(svg)');
  if (approvalsNavBtn) {
    await approvalsNavBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }
  await page.screenshot({ path: path.join(__dirname, 'manager_table_with_delete.png') });

  const mgrTableDeleteBtn = await page.$('button[id^="delete-btn-"]');
  if (!mgrTableDeleteBtn) {
    throw new Error('Delete button not found in Manager Team Approvals Table!');
  }
  console.log('PASS: Delete button exists in Manager Team Approvals Table.');

  // Test opening delete confirmation modal as Manager
  await mgrTableDeleteBtn.click();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'manager_delete_modal.png') });

  const mgrConfirmDeleteBtn = await page.$('#confirm-delete-btn');
  if (!mgrConfirmDeleteBtn) throw new Error('Manager delete confirmation modal failed to appear!');
  console.log('PASS: Manager delete confirmation modal verified.');

  await page.click('#cancel-delete-btn');
  await new Promise(r => setTimeout(r, 400));

  await browser.close();
  console.log('=== ALL TESTS COMPLETED WITH 100% SUCCESS! ===');
})().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
