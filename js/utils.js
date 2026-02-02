/**
 * BHXH Calculator - Utility Functions
 * Common helper functions for date parsing, formatting, and calculations
 */

/**
 * Parse date from month/year inputs
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Date} - Date object set to first day of month
 */
function parseDate(month, year) {
  return new Date(year, month - 1, 1);
}

/**
 * Calculate months between two dates (inclusive)
 * @param {number} fromMonth - Start month
 * @param {number} fromYear - Start year
 * @param {number} toMonth - End month
 * @param {number} toYear - End year
 * @returns {number} - Total months (inclusive)
 */
function monthsBetweenInclusive(fromMonth, fromYear, toMonth, toYear) {
  return (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
}

/**
 * Format currency with comma thousand separators (#,##0 format)
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted string like "1,000,000 đồng"
 */
function formatCurrency(amount) {
  return Math.round(amount).toLocaleString('en-US') + ' đồng';
}

/**
 * Format number with comma thousand separators (#,##0 format)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number like "1,000,000"
 */
function formatNumber(num) {
  return Math.round(num).toLocaleString('en-US');
}

/**
 * Format period description
 * @param {number} fromMonth - Start month
 * @param {number} fromYear - Start year
 * @param {number} toMonth - End month
 * @param {number} toYear - End year
 * @returns {string} - Formatted period string like "T4/2019 - T6/2019"
 */
function formatPeriod(fromMonth, fromYear, toMonth, toYear) {
  return `T${fromMonth}/${fromYear} - T${toMonth}/${toYear}`;
}

/**
 * Convert total months to years using BHXH rules
 * Rules:
 * - 1-6 months = 0.5 years
 * - 7-11 months = 1 year
 * - 12 months = 1 year (exact)
 * @param {number} months - Total months
 * @returns {number} - Years (can be 0.5)
 */
function monthsToYears(months) {
  const fullYears = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let additionalYears = 0;
  if (remainingMonths >= 1 && remainingMonths <= 6) {
    additionalYears = 0.5;
  } else if (remainingMonths >= 7) {
    additionalYears = 1;
  }

  return fullYears + additionalYears;
}

/**
 * Format months to readable Vietnamese string
 * @param {number} months - Total months
 * @returns {string} - Formatted string like "1 năm 3 tháng"
 */
function formatMonthsToYearsVN(months) {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let parts = [];
  if (years > 0) {
    parts.push(`${years} năm`);
  }
  if (remainingMonths > 0) {
    parts.push(`${remainingMonths} tháng`);
  }

  return parts.length > 0 ? parts.join(' ') : '0 tháng';
}

/**
 * Format converted years to Vietnamese string
 * @param {number} years - Years (can include 0.5)
 * @returns {string} - Formatted string
 */
function formatYearsVN(years) {
  if (years === 0.5) {
    return '0,5 năm';
  }
  if (years % 1 === 0.5) {
    return `${Math.floor(years)},5 năm`;
  }
  return `${years} năm`;
}

/**
 * Check if a date range is valid
 * @param {number} fromMonth 
 * @param {number} fromYear 
 * @param {number} toMonth 
 * @param {number} toYear 
 * @returns {boolean}
 */
function isValidDateRange(fromMonth, fromYear, toMonth, toYear) {
  const from = parseDate(fromMonth, fromYear);
  const to = parseDate(toMonth, toYear);
  return to >= from;
}

/**
 * Check if two periods overlap
 * @param {Object} period1 - {fromMonth, fromYear, toMonth, toYear}
 * @param {Object} period2 - {fromMonth, fromYear, toMonth, toYear}
 * @returns {boolean}
 */
function periodsOverlap(period1, period2) {
  const start1 = period1.fromYear * 12 + period1.fromMonth;
  const end1 = period1.toYear * 12 + period1.toMonth;
  const start2 = period2.fromYear * 12 + period2.fromMonth;
  const end2 = period2.toYear * 12 + period2.toMonth;

  return start1 <= end2 && start2 <= end1;
}

/**
 * Split a period into before and from 2014
 * @param {number} fromMonth 
 * @param {number} fromYear 
 * @param {number} toMonth 
 * @param {number} toYear 
 * @returns {Object} - {before2014: months, from2014: months}
 */
function splitPeriodBy2014(fromMonth, fromYear, toMonth, toYear) {
  const cutoffMonth = 1;
  const cutoffYear = 2014;

  // If entire period is before 2014
  if (toYear < cutoffYear) {
    return {
      before2014: monthsBetweenInclusive(fromMonth, fromYear, toMonth, toYear),
      from2014: 0
    };
  }

  // If entire period is from 2014 onwards
  if (fromYear > cutoffYear || (fromYear === cutoffYear && fromMonth >= cutoffMonth)) {
    return {
      before2014: 0,
      from2014: monthsBetweenInclusive(fromMonth, fromYear, toMonth, toYear)
    };
  }

  // Period spans across 2014
  const monthsBefore = monthsBetweenInclusive(fromMonth, fromYear, 12, 2013);
  const monthsFrom = monthsBetweenInclusive(1, 2014, toMonth, toYear);

  return {
    before2014: monthsBefore,
    from2014: monthsFrom
  };
}

/**
 * Get months in each year for a period
 * @param {number} fromMonth 
 * @param {number} fromYear 
 * @param {number} toMonth 
 * @param {number} toYear 
 * @returns {Array} - Array of {year, months}
 */
function getMonthsByYear(fromMonth, fromYear, toMonth, toYear) {
  const result = [];

  for (let year = fromYear; year <= toYear; year++) {
    let startMonth = year === fromYear ? fromMonth : 1;
    let endMonth = year === toYear ? toMonth : 12;
    let months = endMonth - startMonth + 1;

    result.push({ year, months, startMonth, endMonth });
  }

  return result;
}

/**
 * Generate month options for dropdown
 * @returns {string} - HTML options string
 */
function generateMonthOptions() {
  let options = '';
  for (let i = 1; i <= 12; i++) {
    options += `<option value="${i}">Tháng ${i}</option>`;
  }
  return options;
}

/**
 * Generate year options for dropdown
 * @param {number} startYear - Start year (default 1995)
 * @param {number} endYear - End year (default current year + 1)
 * @returns {string} - HTML options string
 */
function generateYearOptions(startYear = 1995, endYear = new Date().getFullYear() + 1) {
  let options = '';
  for (let i = endYear; i >= startYear; i--) {
    options += `<option value="${i}">${i}</option>`;
  }
  return options;
}

/**
 * Deep clone an object
 * @param {Object} obj 
 * @returns {Object}
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
