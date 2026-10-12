// Weights applied to the first 10 digits of a Norwegian bank account number,
// left to right, as described in valid_account_numbers.md.
const ACCOUNT_NUMBER_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

function randomDigit() {
    return Math.floor(Math.random() * 10);
}

function calculateCheckDigit(firstTenDigits) {
    const sum = firstTenDigits.reduce((total, digit, index) => total + digit * ACCOUNT_NUMBER_WEIGHTS[index], 0);
    const remainder = sum % 11;
    const checkDigit = 11 - remainder;

    if (checkDigit === 11) {
        return 0;
    }
    // A remainder of 1 (check digit 10) cannot be represented and means these digits can't form a valid account number.
    if (checkDigit === 10) {
        return null;
    }
    return checkDigit;
}

function generateAccountNumber(bankRegNumber) {
    // Try until we land on a combination of digits whose check digit isn't 10 (invalid).
    // In practice there is an ish 9% chance to fail so for 100 to fail in a row is crazy.
    for (let attempt = 0; attempt < 100; attempt++) {
        const accountDigits = Array.from({length: 6}, randomDigit);
        const firstTenDigits = bankRegNumber.split("").map(Number).concat(accountDigits);
        const checkDigit = calculateCheckDigit(firstTenDigits);

        if (checkDigit !== null) {
            return firstTenDigits.join("") + checkDigit;
        }
    }

    throw new Error("Could not generate a valid account number, please try again.");
}

document.addEventListener('DOMContentLoaded', function () {
    const bankRegNumberInput = document.getElementById('account-number-bank-reg-number');
    const generateButton = document.getElementById('account-number-generate');
    const resultValue = document.getElementById('account-number-result-value');
    const copyButton = document.getElementById('account-number-copy');
    const errorOutput = document.getElementById('account-number-error');
    const statusOutput = document.getElementById('account-number-status');

    if (!bankRegNumberInput || !generateButton || !resultValue || !copyButton || !statusOutput) {
        return;
    }

    function resetCopyButton() {
        copyButton.disabled = !resultValue.value;
        copyButton.textContent = 'Copy';
    }

    generateButton.addEventListener('click', function () {
        const bankRegNumber = bankRegNumberInput.value.trim();
        errorOutput.textContent = '';
        statusOutput.textContent = '';
        resultValue.value = '';
        resetCopyButton();

        if (!/^\d{4}$/.test(bankRegNumber)) {
            errorOutput.textContent = 'Bank identifier must be exactly 4 digits.';
            return;
        }

        try {
            resultValue.value = generateAccountNumber(bankRegNumber);
            resetCopyButton();
            statusOutput.textContent = 'Generated account number ' + resultValue.value;
        } catch (error) {
            errorOutput.textContent = error.message;
        }
    });

    copyButton.addEventListener('click', function () {
        if (!resultValue.value) {
            return;
        }

        if (!navigator.clipboard) {
            errorOutput.textContent = 'Clipboard access is unavailable, please copy the account number manually.';
            return;
        }

        navigator.clipboard.writeText(resultValue.value).then(function () {
            errorOutput.textContent = '';
            copyButton.innerHTML = '<span style="color: #1e8e3e;">\u2713</span> Copied!';
            statusOutput.textContent = 'Account number copied to clipboard.';
            setTimeout(resetCopyButton, 1500);
        }, function () {
            errorOutput.textContent = 'Could not copy automatically, please copy the account number manually.';
        });
    });
});
