# Valid Account Numbers 

The modulus 11 algorithm for Norwegian bank account numbers is used to validate the check digit at the end of the account number.

## Generate a Test Account Number

Use the generator below to create a valid account number for testing. It defaults to [DNB's](dictionary.md) bank identifier `7001`, which is fully enabled in our test environment. The check digit is computed purely from the identifier you enter, so any 4 digits work, including ones for banks that are disabled or unsupported in test, if you want to exercise those rejection paths. Use `GET /v2/banks` to see which bank identifiers are currently enabled.

<div class="admonition example">
<p class="admonition-title">Try it</p>
<div class="account-number-generator">
  <div class="account-number-generator__row">
    <label class="account-number-generator__label" for="account-number-bank-reg-number">Bank identifier</label>
    <input class="md-input account-number-generator__input" type="text" id="account-number-bank-reg-number" value="7001" maxlength="4" inputmode="numeric" pattern="\d{4}">
    <button class="md-button md-button--primary account-number-generator__button" id="account-number-generate" type="button">Generate</button>
  </div>
  <div class="account-number-generator__row">
    <label class="account-number-generator__label" for="account-number-result-value">Account number</label>
    <input class="md-input account-number-generator__input" type="text" id="account-number-result-value" readonly placeholder="—">
    <button class="md-button account-number-generator__button" id="account-number-copy" type="button" disabled>Copy</button>
  </div>
  <p id="account-number-error" class="account-number-error" role="alert"></p>
</div>
</div>

This runs entirely in your browser using the algorithm described below; it does not call any API or send data anywhere.

## Structure 
A Norwegian bank account number consists of 11 digits, where the first 4 digits represent the [bank reg number](dictionary.md) and the last digit is a check digit. 

## Calculation
To display the calculation of the check digit, we will use the following example account number: 
```
15067328555
```


### Weights
Assign weights to the first 10 digits of the account number. The weights are: 2, 3, 4, 5, 6, 7, 2, 3, 4, 5 (repeating after 7), starting from the digit immediately before the check digit and moving left.
```
5 (weight 2)
5 (weight 3)
8 (weight 4)
2 (weight 5)
3 (weight 6)
7 (weight 7)
6 (weight 2)
0 (weight 3)
5 (weight 4)
1 (weight 5)
```

### Multiply and Sum
Multiply each digit by its corresponding weight and sum the results:
```
5 * 2 = 10
5 * 3 = 15
8 * 4 = 32
2 * 5 = 10
3 * 6 = 18
7 * 7 = 49
6 * 2 = 12
0 * 3 = 0
5 * 4 = 20
1 * 5 = 5
```

The sum is 
```
10 + 15 + 32 + 10 + 18 + 49 + 12 + 0 + 20 + 5 = 171
```

### Modulo Operation
Now, take the sum and divide it by 11 and find the remainder:
```
171 % 11 = 6
```

### Check Digit
Subtract the remainder from 11 to get the check digit:
```
11 - 6 = 5
```
It is important to note that if the result is 11, the check digit is 0. If the result is 10, the account number is invalid.

In this case, the check digit is 5, which matches the last digit of the account number. Therefore, the account number **15067328555** is valid.
