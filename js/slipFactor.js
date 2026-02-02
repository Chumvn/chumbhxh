/**
 * BHXH Calculator - Slip Factor Data
 */

const SLIP_FACTOR_DATA = {
    2026: {
        compulsory: {
            1995: 5.01, 1996: 4.72, 1997: 4.57, 1998: 4.23, 1999: 4.05,
            2000: 4.18, 2001: 4.19, 2002: 4.04, 2003: 3.92, 2004: 3.64,
            2005: 3.38, 2006: 3.14, 2007: 2.91, 2008: 2.49, 2009: 2.32,
            2010: 2.14, 2011: 1.78, 2012: 1.64, 2013: 1.54, 2014: 1.47,
            2015: 1.47, 2016: 1.44, 2017: 1.39, 2018: 1.34, 2019: 1.16,
            2020: 1.12, 2021: 1.10, 2022: 1.07, 2023: 1.04, 2024: 1.00, 2025: 1.00
        },
        voluntary: {
            2008: 2.49, 2009: 2.32, 2010: 2.14, 2011: 1.78, 2012: 1.64,
            2013: 1.54, 2014: 1.47, 2015: 1.47, 2016: 1.44, 2017: 1.39,
            2018: 1.34, 2019: 1.16, 2020: 1.12, 2021: 1.10, 2022: 1.07,
            2023: 1.04, 2024: 1.00, 2025: 1.00
        }
    }
};

const GOV_SUPPORT_BASE = {
    '2018-2021': { startMonth: 1, startYear: 2018, endMonth: 12, endYear: 2021, baseValue: 700000 },
    '2022-2025': { startMonth: 1, startYear: 2022, endMonth: 12, endYear: 2025, baseValue: 1500000 }
};

const GOV_SUPPORT_RATES = {
    'ho_ngheo': { name: 'Hộ nghèo', rate: 0.30 },
    'ho_can_ngheo': { name: 'Hộ cận nghèo', rate: 0.25 },
    'doi_tuong_khac': { name: 'Đối tượng khác', rate: 0.10 }
};

const VOLUNTARY_CONTRIBUTION_RATE = 0.22;

function getSlipFactor(year, type = 'compulsory', baseYear = 2026) {
    const yearData = SLIP_FACTOR_DATA[baseYear] || SLIP_FACTOR_DATA[2026];
    const typeData = yearData[type] || yearData.compulsory;
    if (typeData[year] !== undefined) return typeData[year];
    const years = Object.keys(typeData).map(Number).sort((a, b) => a - b);
    if (year < years[0]) return typeData[years[0]];
    return 1.0;
}

function getAllSlipFactors(type = 'compulsory', baseYear = 2026) {
    return SLIP_FACTOR_DATA[baseYear]?.[type] || SLIP_FACTOR_DATA[2026][type] || {};
}

function calculateOverlapMonths(from1Month, from1Year, to1Month, to1Year, from2Month, from2Year, to2Month, to2Year) {
    const start1 = from1Year * 12 + from1Month;
    const end1 = to1Year * 12 + to1Month;
    const start2 = from2Year * 12 + from2Month;
    const end2 = to2Year * 12 + to2Month;
    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    return overlapStart > overlapEnd ? 0 : overlapEnd - overlapStart + 1;
}

function calculateGovSupport(fromMonth, fromYear, toMonth, toYear, subjectType) {
    const details = [];
    let totalSupport = 0;
    const subjectRate = GOV_SUPPORT_RATES[subjectType]?.rate || 0;

    for (const [periodKey, periodData] of Object.entries(GOV_SUPPORT_BASE)) {
        const overlapMonths = calculateOverlapMonths(
            fromMonth, fromYear, toMonth, toYear,
            periodData.startMonth, periodData.startYear, periodData.endMonth, periodData.endYear
        );
        if (overlapMonths > 0) {
            const supportPerMonth = VOLUNTARY_CONTRIBUTION_RATE * periodData.baseValue * subjectRate;
            const periodSupport = supportPerMonth * overlapMonths;
            details.push({
                period: periodKey, baseValue: periodData.baseValue, months: overlapMonths,
                supportPerMonth, totalSupport: periodSupport,
                formula: `0.22 × ${formatNumber(periodData.baseValue)} × ${subjectRate * 100}% × ${overlapMonths} = ${formatNumber(periodSupport)}`
            });
            totalSupport += periodSupport;
        }
    }
    return { totalSupport, details, subjectType, subjectName: GOV_SUPPORT_RATES[subjectType]?.name || 'Không xác định' };
}

function generateSlipFactorTable(type = 'compulsory', baseYear = 2026) {
    const factors = getAllSlipFactors(type, baseYear);
    const years = Object.keys(factors).map(Number).sort((a, b) => b - a);
    let html = '<table class="slip-table"><thead><tr><th>Năm đóng</th><th>Hệ số</th></tr></thead><tbody>';
    for (const year of years) {
        html += `<tr><td>${year}</td><td>${factors[year].toFixed(2)}</td></tr>`;
    }
    return html + '</tbody></table>';
}
