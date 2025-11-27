document.getElementById("calcNetBtn").addEventListener("click", function () {
    const grossIncome = parseFloat(document.getElementById("grossIncome").value);
    const includesVAT = document.getElementById("includesVAT").value;
    const vatRate = parseFloat(document.getElementById("vatRate").value) / 100;
    const age = parseFloat(document.getElementById("age").value);
    const taxPoints = parseFloat(document.getElementById("taxPoints").value);
    const expenses = parseFloat(document.getElementById("expenses").value);
    const vatOnExpenses = parseFloat(document.getElementById("vatOnExpenses").value);
    const pension = parseFloat(document.getElementById("pension").value);
    const incomeTaxRate = parseFloat(document.getElementById("incomeTaxRate").value) / 100;
    const niRate = parseFloat(document.getElementById("niRate").value) / 100;

    let incomeNoVAT;
    let vatCollected;

    // Calculate income excluding VAT and collected VAT
    if (includesVAT === "yes") {
        incomeNoVAT = grossIncome / (1 + vatRate);
        vatCollected = grossIncome - incomeNoVAT;
    } else {
        incomeNoVAT = grossIncome;
        vatCollected = incomeNoVAT * vatRate;
    }

    // Calculate credit points value (example value)
    const creditValue = 235; // This should be dynamic or configured
    const creditTotal = taxPoints * creditValue;

    // Calculate income tax
    let incomeTax = 0;
    const taxable = incomeNoVAT - expenses - pension;

    // Simplified tax bracket logic for illustration (can be expanded)
    if (taxable > 0) {
        incomeTax = Math.max(0, (taxable * incomeTaxRate) - creditTotal);
    }

    // Calculate National Insurance
    const nationalInsurance = taxable * niRate;

    // Calculate net income
    const netIncome = incomeNoVAT - expenses - pension - incomeTax - nationalInsurance;

    document.getElementById("netResults").innerHTML = `
        <h2>Estimated Net Income:</h2>
        <p>Gross Income: ₪${grossIncome.toFixed(2)}</p>
        <p>VAT Collected: ₪${vatCollected.toFixed(2)}</p>
        <p>Expenses: ₪${expenses.toFixed(2)}</p>
        <p>Pension Contributions: ₪${pension.toFixed(2)}</p>
        <p>Income Tax: ₪${incomeTax.toFixed(2)}</p>
        <p>National Insurance: ₪${nationalInsurance.toFixed(2)}</p>
        <strong>Estimated Net Income: ₪${netIncome.toFixed(2)}</strong>
    `;
});

