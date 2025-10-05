import fs from 'fs/promises';

function parseDentrixLine(line: string): any {
    try {
        let rest = line;
        const date = rest.substring(0, 10);
        rest = rest.substring(10).trim();

        const phoneMatch = rest.match(/\(.*?\)$/);
        const phone = phoneMatch ? phoneMatch[0] : null;
        if (phone) rest = rest.slice(0, rest.lastIndexOf(phone)).trim();

        const providerMatch = rest.match(/(\S+)$/);
        const provider = providerMatch ? providerMatch[0] : null;
        if (provider) rest = rest.slice(0, rest.lastIndexOf(provider)).trim();

        const btMatch = rest.match(/(\d{1,2})$/);
        const bt = btMatch ? btMatch[0] : null;
        if (bt) rest = rest.slice(0, rest.lastIndexOf(bt)).trim();

        const amounts = rest.match(/-?[\d,]+\.\d{2}/g) || [];
        let charges = null;
        let payments = null;
        if (amounts.length > 0) {
            for (const amountStr of amounts) {
                const amount = parseFloat(amountStr.replace(/,/g, ''));
                if (amount >= 0) charges = amount;
                else payments = amount;
                rest = rest.replace(amountStr, '');
            }
        }

        const toothMatch = rest.match(/\s(\d{1,2})\s/);
        const tooth = toothMatch ? toothMatch[1] : null;
        if (tooth) rest = rest.replace(tooth, '');

        const codeMatch = rest.match(/([A-Z][A-Z0-9]+)/);
        const code = codeMatch ? codeMatch[0] : null;
        if (code) rest = rest.replace(code, '');

        const patientNameAndDesc = rest.trim();
        // This is still not perfect, we will assume the first few words are the patient name
        const nameParts: string[] = [];
        const descParts: string[] = [];
        let isName = true;
        for (const part of patientNameAndDesc.split(/\s{2,}/)) {
            if (isName) {
                nameParts.push(part);
                if (part.includes(',')) {
                    isName = false;
                }
            } else {
                descParts.push(part);
            }
        }
        if (nameParts.length === 0 && descParts.length === 0) {
            nameParts.push(patientNameAndDesc);
        }

        return {
            date,
            patientName: nameParts.join(' ').trim(),
            tooth,
            code,
            description: descParts.join(' ').trim(),
            charges,
            payments,
            bt,
            provider,
            phone,
            raw: line
        };
    } catch (e) {
        return { raw: line, error: e.message };
    }
}

export async function parseDentrixPdf(text: string): Promise<any[]> {
    await fs.writeFile('tmp/dentrix.txt', text);
    const lines = text.split('\n');
    const records: any[] = [];
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}/;

    let currentLine = '';

    for (const line of lines) {
        if (line.startsWith('DAY SHEET') || line.startsWith('Martin Abelar DDS') || line.startsWith('Date:Page:') || line.startsWith('DatePatient Name') || line.startsWith('Audit #') || line.trim() === '') {
            continue; // Skip header, footer, and empty lines
        }

        if (dateRegex.test(line)) {
            if (currentLine !== '') {
                records.push(parseDentrixLine(currentLine));
            }
            currentLine = line;
        } else {
            currentLine += ' ' + line.trim();
        }
    }

    if (currentLine !== '') {
        records.push(parseDentrixLine(currentLine));
    }

    return records.filter(r => r.raw); // Filter out any empty records
}

export async function parseEaglesoftPdf(text: string): Promise<any[]> {
    await fs.writeFile('tmp/eaglesoft.txt', text);

    const getMetric = (label: string) => {
        const regex = new RegExp(`${label}:\\s*\\(?\\$([\\d,]+\\.\\d{2})\\)?`);
        const match = text.match(regex);
        if (match) {
            const value = match[1] || match[2]; // Handle optional parenthesis for negative numbers
            return parseFloat(value.replace(/,/g, ''));
        }
        return null;
    };

    const getMetricDirect = (label: string) => {
        const regex = new RegExp(`${label}:\\s*([\\d,]+)`);
        const match = text.match(regex);
        if (match) {
            return parseInt(match[1].replace(/,/g, ''));
        }
        return null;
    };

    const metrics = {
        services: getMetric('Services'),
        deletedServices: getMetric('Deleted Services'),
        taxes: getMetric('Taxes'),
        deletedTaxes: getMetric('Deleted Taxes'),
        debitAdjustments: getMetric('Debit Adjustments'),
        financeCharges: getMetric('Finance Charges'),
        deletedDebits: getMetric('Deleted Debits'),
        cashPayments: getMetric('Cash Payments'),
        checkPayments: getMetric('Check Payments'),
        otherPayments: getMetric('Other Payments'),
        deletedCredits: getMetric('Deleted Credits'),
        billingCharges: getMetric('Billing Charges'),
        creditAdjustments: getMetric('Credit Adjustments'),
        writeOffs: getMetric('Write Offs'),
        discounts: getMetric('Discounts'),
        deletedDiscounts: getMetric('Deleted Discounts'),
        returnedChecks: getMetric('Returned Checks'),
        returnedCheckServiceCharges: getMetric('Returned Check Service Charges'),
        patientsSeen: getMetricDirect('Patients Seen'),
    };

    return [metrics];
}
