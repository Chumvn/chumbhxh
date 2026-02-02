/**
 * BHXH Calculator - Core Calculation Functions
 */

/**
 * Calculate total participation time from all periods
 */
function calcTotalTime(periods) {
    let totalMonths = 0;
    let monthsBefore2014 = 0;
    let monthsFrom2014 = 0;
    const details = [];

    for (const period of periods) {
        if (period.type === 'maternity' && !period.countTime) continue;

        const months = monthsBetweenInclusive(
            period.fromMonth, period.fromYear,
            period.toMonth, period.toYear
        );

        const split = splitPeriodBy2014(
            period.fromMonth, period.fromYear,
            period.toMonth, period.toYear
        );

        totalMonths += months;
        monthsBefore2014 += split.before2014;
        monthsFrom2014 += split.from2014;

        details.push({
            period: formatPeriod(period.fromMonth, period.fromYear, period.toMonth, period.toYear),
            months,
            before2014: split.before2014,
            from2014: split.from2014
        });
    }

    return {
        totalMonths,
        monthsBefore2014,
        monthsFrom2014,
        yearsBefore2014: monthsToYears(monthsBefore2014),
        yearsFrom2014: monthsToYears(monthsFrom2014),
        totalYears: monthsToYears(totalMonths),
        details
    };
}

/**
 * Calculate average monthly income with slip factor adjustment
 */
function calcAverage(periods, slipFactorYear = 2026) {
    let totalAdjusted = 0;
    let totalMonths = 0;
    const details = [];

    for (const period of periods) {
        if (period.type === 'maternity') continue;

        const monthsByYear = getMonthsByYear(
            period.fromMonth, period.fromYear,
            period.toMonth, period.toYear
        );

        for (const yearInfo of monthsByYear) {
            const factor = getSlipFactor(yearInfo.year, period.type === 'voluntary' ? 'voluntary' : 'compulsory', slipFactorYear);
            const adjusted = period.salary * factor * yearInfo.months;
            totalAdjusted += adjusted;
            totalMonths += yearInfo.months;

            details.push({
                year: yearInfo.year,
                months: yearInfo.months,
                salary: period.salary,
                factor,
                adjusted,
                type: period.type,
                periodStr: `T${yearInfo.startMonth}/${yearInfo.year} - T${yearInfo.endMonth}/${yearInfo.year}`,
                formula: `${formatNumber(period.salary)} × ${factor} × ${yearInfo.months} = ${formatNumber(adjusted)}`
            });
        }
    }

    const average = totalMonths > 0 ? totalAdjusted / totalMonths : 0;

    return {
        totalAdjusted,
        totalMonths,
        average,
        details,
        formula: `${formatNumber(totalAdjusted)} / ${totalMonths} = ${formatNumber(average)}`
    };
}

/**
 * Calculate lump-sum benefit
 */
function calcLumpSum(average, yearsBefore2014, yearsFrom2014) {
    const benefitBefore2014 = average * yearsBefore2014 * 1.5;
    const benefitFrom2014 = average * yearsFrom2014 * 2.0;
    const total = benefitBefore2014 + benefitFrom2014;

    let formula = '';
    const parts = [];

    if (yearsBefore2014 > 0) {
        parts.push(`(${formatNumber(average)} × ${formatYearsVN(yearsBefore2014)} × 1.5 = ${formatNumber(benefitBefore2014)})`);
    }
    if (yearsFrom2014 > 0) {
        parts.push(`(${formatNumber(average)} × ${formatYearsVN(yearsFrom2014)} × 2 = ${formatNumber(benefitFrom2014)})`);
    }

    formula = parts.join(' + ');
    if (parts.length > 1) {
        formula += ` = ${formatNumber(total)}`;
    }

    return {
        benefitBefore2014,
        benefitFrom2014,
        total,
        formula,
        yearsBefore2014,
        yearsFrom2014
    };
}

/**
 * Calculate total government support for voluntary periods
 */
function calcTotalGovSupport(periods) {
    let totalSupport = 0;
    const details = [];

    for (const period of periods) {
        if (period.type !== 'voluntary' || !period.subjectType) continue;

        const support = calculateGovSupport(
            period.fromMonth, period.fromYear,
            period.toMonth, period.toYear,
            period.subjectType
        );

        totalSupport += support.totalSupport;
        if (support.totalSupport > 0) {
            details.push({
                period: formatPeriod(period.fromMonth, period.fromYear, period.toMonth, period.toYear),
                ...support
            });
        }
    }

    return { totalSupport, details };
}

/**
 * Main calculation entry point
 */
function calculateBHXH(periods, slipFactorYear = 2026) {
    // Filter out invalid periods
    const validPeriods = periods.filter(p =>
        p.fromMonth && p.fromYear && p.toMonth && p.toYear &&
        isValidDateRange(p.fromMonth, p.fromYear, p.toMonth, p.toYear)
    );

    if (validPeriods.length === 0) {
        return { error: 'Không có giai đoạn hợp lệ' };
    }

    // Calculate time
    const timeResult = calcTotalTime(validPeriods);

    // Calculate average
    const avgResult = calcAverage(validPeriods, slipFactorYear);

    // Calculate lump-sum benefit
    const lumpSumResult = calcLumpSum(
        avgResult.average,
        timeResult.yearsBefore2014,
        timeResult.yearsFrom2014
    );

    // Calculate government support
    const supportResult = calcTotalGovSupport(validPeriods);

    // Final amount
    const finalAmount = lumpSumResult.total - supportResult.totalSupport;

    return {
        time: timeResult,
        average: avgResult,
        lumpSum: lumpSumResult,
        govSupport: supportResult,
        finalAmount,
        slipFactorYear,
        periods: validPeriods
    };
}
