# Test Data

To construct a complete, working test order from scratch, you need four things:

1. A settlement account for a real [bank identifier](#banks); see [Account Numbers](#account-numbers) for generating one.
2. A real organisation from [BRREG](#customers).
3. A decision: [bypass account ownership validation](#bypassing-account-ownership-validation), since a BRREG organisation and a generated account number have no real ownership relationship, or use a real customer-account number relationship instead.
4. [Signees](#signees) that either match BRREG's registered signing combination, for automatic approval (see [Automatically Approved Signatures](./test_flows.md#automatically-approved-signatures)), or deliberately don't, to send the order to the bank for review instead (see [Signatures Approved by Bank](./test_flows.md#signatures-approved-by-bank) and [Signatures Rejected by Bank](./test_flows.md#signatures-rejected-by-bank)).

Each section below covers its ingredient in detail. For the full picture of how a request moves through the API, see the [Order Statuses Flowchart](./getting_started.md#order-statuses-flowchart) and the [Test flow diagrams](./test_flows.md).

## Banks

All BankAxept bank identifiers are valid. Use `GET /v2/banks` to list them, and `GET /v2/banks/{bankIdentifier}` to look up a single one by its 4 digit [bank identifier](dictionary.md).

```http
GET /psp/v2/banks
```

```json
[
  {
    "name": "DNB Bank ASA",
    "orgNumber": "984851006",
    "supported": true,
    "branchIdentifier": "7001"
  },
  {
    "name": "Nordea Bank Abp, filial i Norge",
    "orgNumber": "920058817",
    "supported": false,
    "branchIdentifier": "6001"
  }
]
```

A new BankAxept merchant agreement needs an existing settlement account. `supported` reflects whether we have an agreement with that bank letting us set one up on their behalf:

- **Customer already has an active acquiring agreement** for the account (check with `GET /v2/merchants/{orgNumber}/acquiring-agreements/{accountNumber}`): `supported` doesn't matter, no new bank agreement is needed.
- **Brand new customer**, no existing agreement: the bank must be `supported`, otherwise the order is rejected with [`unsupported-acquiring-bank`](./problems.md#unsupported-acquiring-bank).

### Banks in the test environment

All BankAxept bank identifiers work end-to-end in test, including [KAR](dictionary.md) account ownership validation, independent of `supported`. To test an invalid or unrecognized bank identifier, use any 4 digits not in `GET /v2/banks`, see [Account Numbers](#account-numbers) for constructing a matching account number.

For a full list of valid Norwegian bank identifiers, refer to the [BITS documentation](https://www.bits.no/document/iban/).

## Account Numbers

Account numbers aren't arbitrary digits: the first 4 digits are the bank identifier, and the last digit is a check digit. Only specific combinations are valid.

### Generate a Test Account Number

Use the generator below to create a valid account number for testing. It defaults to [DNB's](dictionary.md) bank identifier `7001`. The check digit is computed purely from the identifier you enter, so it works for any 4 digit bank identifier, see [Banks](#banks) for which ones are usable in our test environment.

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
  <p id="account-number-status" class="account-number-generator__sr-only" role="status"></p>
</div>
</div>

This runs entirely in your browser using the algorithm described below; it does not call any API or send data anywhere.

<details markdown="1">
<summary>How the check digit is calculated</summary>

**Structure.** A Norwegian bank account number consists of 11 digits, where the first 4 digits represent the [bank identifier](dictionary.md) and the last digit is a check digit.

**Calculation.** The check digit is validated using the modulus 11 algorithm. To display the calculation, we will use the following example account number:
```
15067328555
```


**Weights.** Assign weights to the first 10 digits of the account number. The weights are: 2, 3, 4, 5, 6, 7, 2, 3, 4, 5 (repeating after 7), starting from the digit immediately before the check digit and moving left.
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

**Multiply and sum.** Multiply each digit by its corresponding weight and sum the results:
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

**Modulo operation.** Now, take the sum and divide it by 11 and find the remainder:
```
171 % 11 = 6
```

**Check digit.** Subtract the remainder from 11 to get the check digit:
```
11 - 6 = 5
```
It is important to note that if the result is 11, the check digit is 0. If the result is 10, the account number is invalid.

In this case, the check digit is 5, which matches the last digit of the account number. Therefore, the account number **15067328555** is valid.

</details>

## Bypassing Account Ownership Validation

Normally we verify the settlement account belongs to the customer using [KAR](dictionary.md). Bypass this in test to register orders for any customer with any valid account number, without real ownership between them:

```http
PUT /psp/v2/simulation/configuration
Content-Type: application/json

{
  "bypassAccountOwnershipCheck": true
}
```

This applies to the whole API client, not a single order, and persists until changed, so it affects anyone sharing your test credentials too. It doesn't relax any other validation; the account number still has to be valid on its own.

Set it back to `false` to exercise the real KAR path instead. This is rarely necessary: whether our integration correctly calls KAR is something we verify, not something your integration needs to confirm. This endpoint, like the rest of `/psp/v2/simulation/*`, only exists in the test environment.

## Customers

Test, like production, validates customers against [BRREG](dictionary.md), so any active Norwegian organisation works as test data. Use [BRREG's public lookup](https://virksomhet.brreg.no) to search by name. Any active result works, there's no fixed or recommended set.

## Signees

`POST /psp/v2/simulation/signatures` validates the signees you submit against BRREG's signing authority data for the organisation. A match sends the order straight to `BAX_ACTIVE`; no match sends it to `PENDING_BANK_RESPONSE`. See [Automatically Approved Signatures](./test_flows.md#automatically-approved-signatures) and [Signatures Approved by Bank](./test_flows.md#signatures-approved-by-bank).

Two BRREG endpoints are checked, a match on either is enough:

```
GET https://data.brreg.no/fullmakt/enheter/{organisasjonsnummer}/signatur
GET https://data.brreg.no/fullmakt/enheter/{organisasjonsnummer}/prokura
```

`signatur` covers role-based signing rights (board, managing director). `prokura` covers a separately registered power of attorney; many organisations don't have one, which looks like `{"signeringsGrunnlag": {"kode": "SI", "tekstforklaring": "Signeringsgrunnlag finnes ikke"}}`, a normal response, not an error.

### Reading a `signatur` response

Invented example, not real data:

```json
{
  "signeringsGrunnlag": {
    "muligeSigneringsRoller": {
      "personRolleGrunnlag": [
        { "fodselsdato": "01.01.1980", "navn": "Kari Nordmann", "rolle": { "kode": "DAGL" } },
        { "fodselsdato": "02.02.1975", "navn": "Ola Nordmann", "rolle": { "kode": "LEDE" } },
        { "fodselsdato": "03.03.1978", "navn": "Per Hansen", "rolle": { "kode": "MEDL" } },
        { "fodselsdato": "04.04.1982", "navn": "Mona Lund", "rolle": { "kode": "MEDL" } }
      ]
    },
    "signaturProkuraRoller": { "signaturProkuraFritekst": "To styremedlemmer i fellesskap. Daglig leder eller styrets leder hver for seg." }
  },
  "signeringsKombinasjon": {
    "kombinasjon": [
      {
        "kode": "STYR",
        "personRolleKombinasjon": [
          { "fodselsdato": "02.02.1975", "navn": "Ola Nordmann", "rolle": { "kode": "LEDE" } },
          { "fodselsdato": "03.03.1978", "navn": "Per Hansen", "rolle": { "kode": "MEDL" } },
          { "fodselsdato": "04.04.1982", "navn": "Mona Lund", "rolle": { "kode": "MEDL" } }
        ],
        "tekstforklaring": "Styret i fellesskap"
      }
    ]
  },
  "status": {
    "regelStatus": { "kode": "RI", "tekstforklaring": "Regel er ikke registrert eller standardisert." }
  }
}
```

Two things matter here:

- **Use `signeringsKombinasjon.kombinasjon`, not `personRolleGrunnlag`.** The latter is just a flat list of everyone holding a relevant role (`DAGL` managing director, `LEDE` board chair, `MEDL` board member); it doesn't say who can sign, or together with whom. Each entry under `kombinasjon` is one complete, valid combination, for example `"Styret i fellesskap"` ("the board, jointly") above. Submit that entire set, and only that set, to get a match.
- **`regelStatus: "RI"`** ("rule not standardized") means BRREG couldn't mechanically derive a simpler combination, even if the free text (`signaturProkuraFritekst`) hints that one exists, and falls back to one safe combination instead (here, the whole board). Only what's listed under `kombinasjon` is usable for simulation.

### Submitting signees that match

Submit the exact set of people from one combination, no more, no fewer. Matching is on full name (exact string) and date of birth:

```http
POST /psp/v2/simulation/signatures
Content-Type: application/json

{
  "orderId": "{orderId}",
  "signees": [
    { "fullName": "Ola Nordmann", "dateOfBirth": "1975-02-02", "email": "ola.nordmann@example.com" },
    { "fullName": "Per Hansen", "dateOfBirth": "1978-03-03", "email": "per.hansen@example.com" },
    { "fullName": "Mona Lund", "dateOfBirth": "1982-04-04", "email": "mona.lund@example.com" }
  ]
}
```

`email` isn't checked against BRREG, it only identifies the signee within your order.

A subset, an extra person, or anyone not in a combination won't match, sending the order to `PENDING_BANK_RESPONSE`, see [Signatures Approved by Bank](./test_flows.md#signatures-approved-by-bank) and [Signatures Rejected by Bank](./test_flows.md#signatures-rejected-by-bank) for simulating what happens next.
