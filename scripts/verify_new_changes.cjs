const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('=== TEST 1: Admin Login Form Space Minimization & Removed Elements ===');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(__dirname, 'admin_login_minimized.png') });

  // Verify that neither "Administrator Gateway" nor "Administrator Login" exists in the login form card
  const cardText = await page.$eval('.max-w-md', el => el.innerText).catch(() => '');
  console.log('Admin card text preview:', cardText.replace(/\n+/g, ' '));
  
  if (cardText.includes('Administrator Gateway')) {
    throw new Error('Found "Administrator Gateway" inside admin login card!');
  }
  if (cardText.includes('Administrator Login')) {
    throw new Error('Found "Administrator Login" inside admin login card!');
  }
  console.log('PASS: Administrator Gateway and Administrator Login completely removed from card.');

  console.log('=== TEST 2: Admin Navbar Remove Add Employee ===');
  // Login as Admin
  await page.type('#login-email-input', 'admin@elms.com');
  await page.type('#login-password-input', 'admin123');
  await page.click('#login-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(__dirname, 'admin_portal_no_navbar_add_emp.png') });

  // Verify #header-add-employee-btn does NOT exist in the header
  const headerAddEmpBtn = await page.$('#header-add-employee-btn');
  if (headerAddEmpBtn) {
    throw new Error('Header Add Employee button still found in navbar!');
  }
  console.log('PASS: Add Employee button successfully removed from navbar.');

  // Verify that Sidebar Add Employee still exists
  const sidebarAddEmpBtn = await page.$('#sidebar-add-employee-btn');
  if (!sidebarAddEmpBtn) {
    throw new Error('Sidebar Add Employee button is missing!');
  }
  console.log('PASS: Sidebar Add Employee button exists as expected.');

  await browser.close();
  console.log('=== ALL TESTS COMPLETED SUCCESSFULLY! ===');
})().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
