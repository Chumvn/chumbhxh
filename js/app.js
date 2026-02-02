/**
 * BHXH Calculator - Main Application
 */

// State management
let currentTab = 'both';
let periods = [];
let periodCounter = 0;

// DOM Elements
const elements = {};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initElements();
  initEventListeners();
  seedSampleData();
  updatePeriodsList();
});

// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem('bhxh-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon(true);
  }
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('bhxh-theme', 'light');
    updateThemeIcon(false);
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('bhxh-theme', 'dark');
    updateThemeIcon(true);
  }
}

function updateThemeIcon(isDark) {
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.textContent = isDark ? '☀️' : '🌙';
  }
}

function initElements() {
  elements.tabBtns = document.querySelectorAll('.tab-btn');
  elements.periodsContainer = document.getElementById('periodsContainer');
  elements.slipFactorYear = document.getElementById('slipFactorYear');
  elements.calculateBtn = document.getElementById('calculateBtn');
  elements.resultsSection = document.getElementById('resultsSection');
  elements.summaryContent = document.getElementById('summaryContent');
  elements.detailContent = document.getElementById('detailContent');
  elements.tableContent = document.getElementById('tableContent');
  elements.modalOverlay = document.getElementById('modalOverlay');
  elements.modalBody = document.getElementById('modalBody');
}

function initEventListeners() {
  // Tab switching
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Add period buttons
  document.getElementById('addCompulsoryBtn')?.addEventListener('click', () => addPeriod('compulsory'));
  document.getElementById('addVoluntaryBtn')?.addEventListener('click', () => addPeriod('voluntary'));
  document.getElementById('addMaternityBtn')?.addEventListener('click', () => addPeriod('maternity'));

  // Calculate button
  elements.calculateBtn?.addEventListener('click', calculate);

  // Modal
  document.getElementById('viewSlipFactorBtn')?.addEventListener('click', showSlipFactorModal);
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  elements.modalOverlay?.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) closeModal();
  });

  // Export buttons
  document.getElementById('copyBtn')?.addEventListener('click', copyExplanation);
  document.getElementById('downloadJsonBtn')?.addEventListener('click', downloadJson);
  document.getElementById('downloadPngBtn')?.addEventListener('click', downloadPng);
  document.getElementById('downloadPdfBtn')?.addEventListener('click', downloadPdf);
  document.getElementById('downloadDocBtn')?.addEventListener('click', downloadDoc);

  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
}

function switchTab(tab) {
  currentTab = tab;
  elements.tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  updateAddButtons();
}

function updateAddButtons() {
  const compBtn = document.getElementById('addCompulsoryBtn');
  const volBtn = document.getElementById('addVoluntaryBtn');

  if (currentTab === 'compulsory') {
    compBtn?.classList.remove('hidden');
    volBtn?.classList.add('hidden');
  } else if (currentTab === 'voluntary') {
    compBtn?.classList.add('hidden');
    volBtn?.classList.remove('hidden');
  } else {
    compBtn?.classList.remove('hidden');
    volBtn?.classList.remove('hidden');
  }
}

function addPeriod(type) {
  const id = ++periodCounter;
  const currentYear = new Date().getFullYear();

  periods.push({
    id,
    type,
    fromMonth: 1,
    fromYear: currentYear,
    toMonth: 12,
    toYear: currentYear,
    salary: 0,
    subjectType: 'doi_tuong_khac',
    countTime: type !== 'maternity'
  });

  updatePeriodsList();
}

function removePeriod(id) {
  periods = periods.filter(p => p.id !== id);
  updatePeriodsList();
}

function updatePeriodsList() {
  if (!elements.periodsContainer) return;

  elements.periodsContainer.innerHTML = periods.map(period => createPeriodCard(period)).join('');

  // Add event listeners for each period
  periods.forEach(period => {
    const card = document.getElementById(`period-${period.id}`);
    if (!card) return;

    // From date
    card.querySelector('.from-month')?.addEventListener('change', (e) => {
      period.fromMonth = parseInt(e.target.value);
      updatePeriodMonths(period.id);
    });
    card.querySelector('.from-year')?.addEventListener('change', (e) => {
      period.fromYear = parseInt(e.target.value);
      updatePeriodMonths(period.id);
    });

    // To date
    card.querySelector('.to-month')?.addEventListener('change', (e) => {
      period.toMonth = parseInt(e.target.value);
      updatePeriodMonths(period.id);
    });
    card.querySelector('.to-year')?.addEventListener('change', (e) => {
      period.toYear = parseInt(e.target.value);
      updatePeriodMonths(period.id);
    });

    // Salary
    card.querySelector('.salary')?.addEventListener('input', (e) => {
      period.salary = parseFloat(e.target.value.replace(/[,.]/g, '')) || 0;
    });

    // Subject type (voluntary only)
    card.querySelector('.subject-type')?.addEventListener('change', (e) => {
      period.subjectType = e.target.value;
    });

    // Count time checkbox (maternity only)
    card.querySelector('.count-time')?.addEventListener('change', (e) => {
      period.countTime = e.target.checked;
    });

    // Remove button
    card.querySelector('.remove-btn')?.addEventListener('click', () => removePeriod(period.id));
  });
}

function createPeriodCard(period) {
  const typeLabels = {
    compulsory: 'BHXH Bắt buộc',
    voluntary: 'BHXH Tự nguyện',
    maternity: 'Thai sản'
  };

  const months = isValidDateRange(period.fromMonth, period.fromYear, period.toMonth, period.toYear)
    ? monthsBetweenInclusive(period.fromMonth, period.fromYear, period.toMonth, period.toYear)
    : 0;

  let subjectSelect = '';
  if (period.type === 'voluntary') {
    subjectSelect = `
      <div class="subject-group">
        <label class="form-label">Đối tượng tham gia</label>
        <select class="form-select subject-type">
          <option value="ho_ngheo" ${period.subjectType === 'ho_ngheo' ? 'selected' : ''}>Hộ nghèo</option>
          <option value="ho_can_ngheo" ${period.subjectType === 'ho_can_ngheo' ? 'selected' : ''}>Hộ cận nghèo</option>
          <option value="doi_tuong_khac" ${period.subjectType === 'doi_tuong_khac' ? 'selected' : ''}>Đối tượng khác</option>
        </select>
      </div>`;
  }

  let countTimeCheckbox = '';
  if (period.type === 'maternity') {
    countTimeCheckbox = `
      <div class="mt-2">
        <label class="checkbox-wrapper">
          <input type="checkbox" class="count-time" ${period.countTime ? 'checked' : ''}>
          <span class="checkbox-custom"></span>
          <span class="checkbox-label">Tính vào thời gian đóng BHXH</span>
        </label>
      </div>`;
  }

  const salaryLabel = period.type === 'voluntary' ? 'Mức thu nhập đóng BHXH' : 'Mức lương đóng BHXH';
  const salaryHidden = period.type === 'maternity' ? 'hidden' : '';

  return `
    <div class="period-card neu-flat" id="period-${period.id}">
      <button class="remove-btn" title="Xóa giai đoạn">×</button>
      <div class="period-header">
        <span class="period-title">Giai đoạn ${period.id}</span>
        <span class="period-badge ${period.type}">${typeLabels[period.type]}</span>
      </div>
      <div class="period-row">
        <div class="form-group">
          <label class="form-label">Từ tháng</label>
          <select class="form-select from-month">${generateMonthOptionsSelected(period.fromMonth)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Từ năm</label>
          <select class="form-select from-year">${generateYearOptionsSelected(period.fromYear)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Đến tháng</label>
          <select class="form-select to-month">${generateMonthOptionsSelected(period.toMonth)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Đến năm</label>
          <select class="form-select to-year">${generateYearOptionsSelected(period.toYear)}</select>
        </div>
        <div class="form-group ${salaryHidden}">
          <label class="form-label">${salaryLabel} (VNĐ)</label>
          <input type="text" class="form-input salary" placeholder="Nhập số tiền" value="${period.salary > 0 ? formatNumber(period.salary) : ''}">
        </div>
      </div>
      ${subjectSelect}
      ${countTimeCheckbox}
      <div class="period-months" id="months-${period.id}">Thời gian: ${months} tháng</div>
    </div>`;
}

function generateMonthOptionsSelected(selected) {
  let options = '';
  for (let i = 1; i <= 12; i++) {
    options += `<option value="${i}" ${i === selected ? 'selected' : ''}>Tháng ${i}</option>`;
  }
  return options;
}

function generateYearOptionsSelected(selected, start = 1995, end = new Date().getFullYear() + 1) {
  let options = '';
  for (let i = end; i >= start; i--) {
    options += `<option value="${i}" ${i === selected ? 'selected' : ''}>${i}</option>`;
  }
  return options;
}

function updatePeriodMonths(id) {
  const period = periods.find(p => p.id === id);
  if (!period) return;

  const monthsEl = document.getElementById(`months-${id}`);
  if (!monthsEl) return;

  if (isValidDateRange(period.fromMonth, period.fromYear, period.toMonth, period.toYear)) {
    const months = monthsBetweenInclusive(period.fromMonth, period.fromYear, period.toMonth, period.toYear);
    monthsEl.textContent = `Thời gian: ${months} tháng`;
    monthsEl.style.color = '';
  } else {
    monthsEl.textContent = 'Lỗi: Ngày kết thúc phải sau ngày bắt đầu';
    monthsEl.style.color = 'var(--accent)';
  }
}

function seedSampleData() {
  periods = [
    { id: ++periodCounter, type: 'voluntary', fromMonth: 4, fromYear: 2019, toMonth: 6, toYear: 2019, salary: 1000000, subjectType: 'doi_tuong_khac', countTime: true },
    { id: ++periodCounter, type: 'compulsory', fromMonth: 4, fromYear: 2024, toMonth: 6, toYear: 2024, salary: 4456000, subjectType: '', countTime: true },
    { id: ++periodCounter, type: 'compulsory', fromMonth: 7, fromYear: 2024, toMonth: 9, toYear: 2024, salary: 4706000, subjectType: '', countTime: true },
    { id: ++periodCounter, type: 'compulsory', fromMonth: 10, fromYear: 2024, toMonth: 12, toYear: 2024, salary: 4736000, subjectType: '', countTime: true }
  ];
}

function calculate() {
  const slipFactorYear = parseInt(elements.slipFactorYear?.value) || 2026;
  const result = calculateBHXH(periods, slipFactorYear);

  if (result.error) {
    alert(result.error);
    return;
  }

  window.lastResult = result;
  renderResults(result);
  elements.resultsSection?.classList.add('show');
  elements.resultsSection?.scrollIntoView({ behavior: 'smooth' });
}

function renderResults(result) {
  renderSummary(result);
  renderDetail(result);
  renderTable(result);
}

function renderSummary(result) {
  const html = `
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-label">Tổng thời gian tham gia</div>
        <div class="summary-value">${formatMonthsToYearsVN(result.time.totalMonths)}</div>
        <div class="summary-label mt-1">(Quy đổi: ${formatYearsVN(result.time.totalYears)})</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Mức bình quân tiền lương/thu nhập</div>
        <div class="summary-value primary">${formatCurrency(result.average.average)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Mức hưởng BHXH 1 lần</div>
        <div class="summary-value">${formatCurrency(result.lumpSum.total)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Nhà nước hỗ trợ (khấu trừ)</div>
        <div class="summary-value danger">- ${formatCurrency(result.govSupport.totalSupport)}</div>
      </div>
      <div class="summary-item highlight">
        <div class="summary-label">TỔNG TIỀN BHXH 1 LẦN ĐƯỢC NHẬN</div>
        <div class="summary-value success">${formatCurrency(result.finalAmount)}</div>
      </div>
    </div>`;
  elements.summaryContent.innerHTML = html;
}

function renderDetail(result) {
  let html = '<div class="detail-content">';

  // Step 1: Time calculation
  html += `<div class="step">
    <div class="step-title">1. Thời gian tham gia BHXH</div>
    <p>Tổng số tháng đóng BHXH: <strong>${result.time.totalMonths} tháng</strong> (${formatMonthsToYearsVN(result.time.totalMonths)})</p>
    <p>Quy đổi theo quy định: <strong>${formatYearsVN(result.time.totalYears)}</strong></p>`;

  if (result.time.monthsBefore2014 > 0) {
    html += `<p>- Trước năm 2014: ${result.time.monthsBefore2014} tháng (${formatYearsVN(result.time.yearsBefore2014)})</p>`;
  }
  if (result.time.monthsFrom2014 > 0) {
    html += `<p>- Từ năm 2014 trở đi: ${result.time.monthsFrom2014} tháng (${formatYearsVN(result.time.yearsFrom2014)})</p>`;
  }
  html += '</div>';

  // Step 2: Average calculation
  html += `<div class="step">
    <div class="step-title">2. Tính mức bình quân tiền lương/thu nhập tháng đóng BHXH</div>
    <p><em>Công thức: (Mức lương × Hệ số trượt giá × Số tháng) / Tổng số tháng</em></p>`;

  for (const d of result.average.details) {
    html += `<p>Giai đoạn ${d.periodStr}: ${d.months} tháng</p>
      <div class="calculation">${d.formula}</div>`;
  }

  html += `<p class="result">Tổng tiền điều chỉnh: ${formatCurrency(result.average.totalAdjusted)}</p>
    <div class="calculation">Bình quân = ${result.average.formula}</div>
    <p class="result">Mức bình quân: ${formatCurrency(result.average.average)}</p>
  </div>`;

  // Step 3: Lump-sum benefit
  html += `<div class="step">
    <div class="step-title">3. Tính mức hưởng BHXH 1 lần</div>
    <p><em>Hệ số: Trước 2014 = 1.5 lần/năm, Từ 2014 = 2 lần/năm</em></p>
    <div class="calculation">${result.lumpSum.formula}</div>
    <p class="result">Mức hưởng: ${formatCurrency(result.lumpSum.total)}</p>
  </div>`;

  // Step 4: Government support (if any)
  if (result.govSupport.totalSupport > 0) {
    html += `<div class="step">
      <div class="step-title">4. Số tiền Nhà nước hỗ trợ đóng BHXH tự nguyện (khấu trừ)</div>
      <p class="note">(Nhà nước bắt đầu hỗ trợ từ 01/01/2018)</p>`;

    for (const d of result.govSupport.details) {
      html += `<p>${d.subjectName} - Giai đoạn ${d.period}:</p>
        <div class="calculation">${d.details.map(x => x.formula).join('<br>')}</div>
        <p>Tổng hỗ trợ giai đoạn: ${formatCurrency(d.totalSupport)}</p>`;
    }

    html += `<p class="result">Tổng tiền Nhà nước hỗ trợ: ${formatCurrency(result.govSupport.totalSupport)}</p>
    </div>`;
  }

  // Final result
  html += `<div class="step">
    <div class="step-title">${result.govSupport.totalSupport > 0 ? '5' : '4'}. Kết quả cuối cùng</div>
    <div class="calculation">${formatNumber(result.lumpSum.total)} - ${formatNumber(result.govSupport.totalSupport)} = ${formatNumber(result.finalAmount)}</div>
    <p class="result" style="font-size: 1.1rem;">TỔNG TIỀN BHXH 1 LẦN ĐƯỢC NHẬN: ${formatCurrency(result.finalAmount)}</p>
  </div>`;

  html += '</div>';
  elements.detailContent.innerHTML = html;
}

function renderTable(result) {
  let html = `<table class="data-table">
    <thead>
      <tr>
        <th>Giai đoạn</th>
        <th>Số tháng</th>
        <th class="number">Mức lương/thu nhập</th>
        <th class="number">Hệ số</th>
        <th class="number">Thành tiền điều chỉnh</th>
        <th>Loại</th>
      </tr>
    </thead>
    <tbody>`;

  for (const d of result.average.details) {
    const typeLabel = d.type === 'voluntary' ? 'Tự nguyện' : 'Bắt buộc';
    html += `<tr>
      <td>${d.periodStr}</td>
      <td>${d.months}</td>
      <td class="number">${formatNumber(d.salary)}</td>
      <td class="number">${d.factor.toFixed(2)}</td>
      <td class="number">${formatNumber(d.adjusted)}</td>
      <td>${typeLabel}</td>
    </tr>`;
  }

  html += `</tbody>
    <tfoot>
      <tr>
        <td><strong>Tổng</strong></td>
        <td><strong>${result.average.totalMonths}</strong></td>
        <td colspan="2"></td>
        <td class="number"><strong>${formatNumber(result.average.totalAdjusted)}</strong></td>
        <td></td>
      </tr>
    </tfoot>
  </table>`;

  elements.tableContent.innerHTML = html;
}

function showSlipFactorModal() {
  const compulsoryTable = generateSlipFactorTable('compulsory', parseInt(elements.slipFactorYear?.value) || 2026);
  const voluntaryTable = generateSlipFactorTable('voluntary', parseInt(elements.slipFactorYear?.value) || 2026);

  elements.modalBody.innerHTML = `
    <h4 style="margin-bottom: 15px;">BHXH Bắt buộc</h4>
    ${compulsoryTable}
    <h4 style="margin: 25px 0 15px;">BHXH Tự nguyện</h4>
    ${voluntaryTable}`;

  elements.modalOverlay.classList.add('show');
}

function closeModal() {
  elements.modalOverlay.classList.remove('show');
}

function copyExplanation() {
  const detailText = elements.detailContent?.innerText || '';
  navigator.clipboard.writeText(detailText).then(() => {
    alert('Đã sao chép diễn giải vào clipboard!');
  }).catch(() => {
    alert('Không thể sao chép. Vui lòng thử lại.');
  });
}

function downloadJson() {
  if (!window.lastResult) {
    alert('Chưa có kết quả để tải xuống');
    return;
  }

  const dataStr = JSON.stringify(window.lastResult, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `bhxh_result_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Download as PNG using html2canvas
async function downloadPng() {
  if (!elements.resultsSection?.classList.contains('show')) {
    alert('Vui lòng tính toán trước khi xuất ảnh');
    return;
  }

  try {
    const canvas = await html2canvas(elements.resultsSection, {
      backgroundColor: '#e0e5ec',
      scale: 2,
      logging: false,
      useCORS: true
    });

    const link = document.createElement('a');
    link.download = `bhxh_result_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error generating PNG:', error);
    alert('Không thể tạo ảnh. Vui lòng thử lại.');
  }
}

// Download as PDF (using print)
function downloadPdf() {
  if (!elements.resultsSection?.classList.contains('show')) {
    alert('Vui lòng tính toán trước khi xuất PDF');
    return;
  }

  // Create a new window with just the results
  const printContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Kết quả tính BHXH 1 lần</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
        h1 { text-align: center; color: #333; font-size: 18px; }
        h2 { color: #6d83f2; font-size: 14px; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
        .summary-item { padding: 10px; background: #f5f5f5; border-radius: 8px; }
        .summary-label { font-size: 11px; color: #666; }
        .summary-value { font-size: 14px; font-weight: bold; color: #333; }
        .highlight { background: #e8f5e9; }
        .success { color: #4caf50; }
        .danger { color: #f44336; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        th { background: #f0f0f0; }
        .number { text-align: right; }
        .calculation { background: #f9f9f9; padding: 8px; margin: 5px 0; font-family: monospace; font-size: 11px; }
        .step { margin-bottom: 15px; }
        .step-title { font-weight: bold; color: #6d83f2; }
        .result { color: #4caf50; font-weight: bold; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
    <h1>KẾT QUẢ TÍNH BẢO HIỂM XÃ HỘI 1 LẦN</h1>
    <p style="text-align: center; color: #666; font-size: 12px;">Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
    
    <h2>TÓM TẮT KẾT QUẢ</h2>
    ${elements.summaryContent?.innerHTML || ''}
    
    <h2>DIỄN GIẢI CHI TIẾT</h2>
    ${elements.detailContent?.innerHTML || ''}
    
    <h2>BẢNG DỮ LIỆU</h2>
    ${elements.tableContent?.innerHTML || ''}
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// Download as DOC
function downloadDoc() {
  if (!window.lastResult) {
    alert('Vui lòng tính toán trước khi xuất DOC');
    return;
  }

  const result = window.lastResult;

  // Create simple HTML content for DOC
  const docContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <title>Kết quả tính BHXH 1 lần</title>
    <style>
        body { font-family: 'Times New Roman', serif; padding: 20px; }
        h1 { text-align: center; font-size: 16pt; }
        h2 { font-size: 13pt; color: #333; border-bottom: 1px solid #000; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5px; font-size: 11pt; }
        th { background: #f0f0f0; }
        .number { text-align: right; }
    </style>
</head>
<body>
    <h1>KẾT QUẢ TÍNH BẢO HIỂM XÃ HỘI 1 LẦN</h1>
    <p style="text-align: center;">Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
    
    <h2>1. TÓM TẮT KẾT QUẢ</h2>
    <table>
        <tr><td><strong>Tổng thời gian tham gia</strong></td><td>${formatMonthsToYearsVN(result.time.totalMonths)} (Quy đổi: ${formatYearsVN(result.time.totalYears)})</td></tr>
        <tr><td><strong>Mức bình quân tiền lương/thu nhập</strong></td><td>${formatCurrency(result.average.average)}</td></tr>
        <tr><td><strong>Mức hưởng BHXH 1 lần</strong></td><td>${formatCurrency(result.lumpSum.total)}</td></tr>
        <tr><td><strong>Nhà nước hỗ trợ (khấu trừ)</strong></td><td>- ${formatCurrency(result.govSupport.totalSupport)}</td></tr>
        <tr style="background: #e8f5e9;"><td><strong>TỔNG TIỀN BHXH 1 LẦN ĐƯỢC NHẬN</strong></td><td><strong>${formatCurrency(result.finalAmount)}</strong></td></tr>
    </table>
    
    <h2>2. BẢNG DỮ LIỆU CHI TIẾT</h2>
    <table>
        <tr>
            <th>Giai đoạn</th>
            <th>Số tháng</th>
            <th>Mức lương/thu nhập</th>
            <th>Hệ số</th>
            <th>Thành tiền điều chỉnh</th>
            <th>Loại</th>
        </tr>
        ${result.average.details.map(d => `
        <tr>
            <td>${d.periodStr}</td>
            <td>${d.months}</td>
            <td class="number">${formatNumber(d.salary)}</td>
            <td class="number">${d.factor.toFixed(2)}</td>
            <td class="number">${formatNumber(d.adjusted)}</td>
            <td>${d.type === 'voluntary' ? 'Tự nguyện' : 'Bắt buộc'}</td>
        </tr>`).join('')}
        <tr>
            <td><strong>Tổng</strong></td>
            <td><strong>${result.average.totalMonths}</strong></td>
            <td colspan="2"></td>
            <td class="number"><strong>${formatNumber(result.average.totalAdjusted)}</strong></td>
            <td></td>
        </tr>
    </table>
    
    <h2>3. CÔNG THỨC TÍNH</h2>
    <p><strong>Bình quân:</strong> ${result.average.formula}</p>
    <p><strong>Mức hưởng:</strong> ${result.lumpSum.formula}</p>
</body>
</html>`;

  const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `bhxh_result_${new Date().toISOString().split('T')[0]}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
