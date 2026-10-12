# Test Data

This page collects practical guidance for constructing test data (banks, accounts, customers and signees) when integrating against the test environment. For the full picture of how a request moves through the API, see the [Order Statuses Flowchart](./getting_started.md#order-statuses-flowchart) and the [Test flow diagrams](./test_flows.md).

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

A new BankAxept merchant agreement needs an existing account to pay settlements to. BankAxept requires an agreement between the customer and the bank to use the given account as a settlement account. For supported banks, we can enter into this agreement with the customer on behalf of the bank; `supported` reflects whether we're able to do this for a given bank.

If the customer already has an active acquiring agreement for the settlement account (check with `GET /v2/merchants/{orgNumber}/acquiring-agreements/{accountNumber}`), they don't need a new agreement with the bank, so `supported` doesn't matter in that case.

**Example: customer switching PSP, keeping their settlement account**
A customer already has a BankAxept merchant agreement through PSP A, settling into an account at a bank with `supported: false`. They want to move to PSP B, using the same settlement account. Since `GET /v2/merchants/{orgNumber}/acquiring-agreements/{accountNumber}` shows they already have an active acquiring agreement for that account, no new agreement with the bank is needed, PSP B can register the order regardless of whether that bank is `supported`.

**Example: brand new customer**
A brand new customer wants to register with a settlement account at a bank with `supported: false`. They have no existing acquiring agreement for that account, so a new financial agreement with the bank would be required, which isn't possible for a bank we don't have this arrangement with. The order can only be registered if `GET /v2/banks` reports `supported: true` for that bank; otherwise it's rejected with the [`unsupported-acquiring-bank`](./problems.md#unsupported-acquiring-bank) problem type.

### Banks in the test environment

In test, all BankAxept bank identifiers work for completing an order end-to-end, including [KAR](dictionary.md) account ownership validation. This is independent of `supported`: that field only reflects whether BankAxept has an agreement in place to create new financial agreements on a bank's behalf, not whether a test order using that bank can be completed. DNB (for example `7001`) is confirmed to have `supported: true`, and other banks may as well, see `GET /v2/banks` for the current list.

If you need to test how your integration behaves with an invalid or unrecognized bank identifier, you can use any 4 digit number that isn't in the `GET /v2/banks` list for that purpose, see [Valid Account Numbers](./valid_account_numbers.md) for how to construct a matching account number.

For a full list of valid Norwegian bank identifiers, refer to the [BITS documentation](https://www.bits.no/document/iban/).

## Bypassing Account Ownership Validation

Normally, we verify that the settlement account on an order belongs to the customer using [KAR](dictionary.md). In the test environment, you can bypass this ownership check so you can register orders for any customer using any valid account number (see [Valid Account Numbers](./valid_account_numbers.md)), without needing an account the customer actually, legally owns. Bypassing ownership does not relax any other validation, the account number must still be valid on its own terms.

```http
PUT /psp/v2/simulation/configuration
Content-Type: application/json

{
  "bypassAccountOwnershipCheck": true
}
```

This call is idempotent: it sets the bypass to the value you provide, regardless of its previous state. The setting applies to the authenticated API client as a whole, not to an individual order or request. There is no automatic expiry or reset, and no way to scope it to a single order; it stays in effect until someone explicitly changes it again. If you share test credentials with other people or systems, for example other developers on your team, changing this setting changes behavior for all of them too, every order anyone registers using that client is affected. Set it back to `false` if you want to test the real [KAR](dictionary.md) path instead, using an organisation and account number with genuine, legal ownership between them. This usually isn't necessary: whether our integration correctly calls KAR and interprets its response is something we verify ourselves, not something your integration needs to independently confirm.

This endpoint, like the rest of `/psp/v2/simulation/*`, only exists in the test environment.

## Customers

Test, like production, validates customers against [BRREG](dictionary.md), so any active Norwegian organisation can be used as test data. Use [BRREG's public lookup](https://virksomhet.brreg.no) to search for one by name and use its organisation number. Any active result works. There's no fixed or recommended set; searching for your own company name or any term relevant to your testing works just as well as anything else.

## Signees

When you simulate signing with `POST /v2/simulation/signatures`, the signees you submit are automatically validated against the signing authority BRREG has on file for the organisation. If they match a valid combination, the order moves straight to `BAX_ACTIVE`. If they don't, it moves to `PENDING_BANK_RESPONSE`, see [Automatically Approved Signatures](./test_flows.md#automatically-approved-signatures) and [Signatures Approved by Bank](./test_flows.md#signatures-approved-by-bank) for the full flows.

This data comes from two BRREG endpoints, checked independently, a match on either is enough:

```
GET https://data.brreg.no/fullmakt/enheter/{organisasjonsnummer}/signatur
GET https://data.brreg.no/fullmakt/enheter/{organisasjonsnummer}/prokura
```

`signatur` covers signing rights derived from company roles (board members, managing director). `prokura` covers a separately registered power of attorney (prokura), many organisations don't have one registered at all, which looks like this:

```json
{
  "signeringsGrunnlag": {
    "kode": "SI",
    "tekstforklaring": "Signeringsgrunnlag finnes ikke"
  }
}
```

`"Signeringsgrunnlag finnes ikke"` translates to "No signing basis exists", this is a normal, expected response, not an error.

### Reading a `signatur` response

Below is an illustrative example (invented organisation, names and dates, not real data):

```json
{
  "enhet": {
    "organisasjonsnummer": "000000000",
    "navn": "EKSEMPEL AS"
  },
  "signeringsGrunnlag": {
    "kode": "SF",
    "muligeSigneringsRoller": {
      "personRolleGrunnlag": [
        { "fodselsdato": "01.01.1980", "navn": "Kari Nordmann", "rolle": { "kode": "DAGL", "tekstforklaring": "Daglig leder" } },
        { "fodselsdato": "02.02.1975", "navn": "Ola Nordmann", "rolle": { "kode": "LEDE", "tekstforklaring": "Styrets leder" } },
        { "fodselsdato": "03.03.1978", "navn": "Per Hansen", "rolle": { "kode": "MEDL", "tekstforklaring": "Styremedlem" } },
        { "fodselsdato": "04.04.1982", "navn": "Mona Lund", "rolle": { "kode": "MEDL", "tekstforklaring": "Styremedlem" } }
      ]
    },
    "signaturProkuraRoller": {
      "signaturProkuraFritekst": "To styremedlemmer i fellesskap. Daglig leder eller styrets leder hver for seg."
    },
    "tekstforklaring": "Signeringsgrunnlag finnes"
  },
  "signeringsKombinasjon": {
    "kombinasjon": [
      {
        "kode": "STYR",
        "kombinasjonsId": "1",
        "personRolleKombinasjon": [
          { "fodselsdato": "02.02.1975", "navn": "Ola Nordmann", "rolle": { "kode": "LEDE", "tekstforklaring": "Styrets leder" } },
          { "fodselsdato": "03.03.1978", "navn": "Per Hansen", "rolle": { "kode": "MEDL", "tekstforklaring": "Styremedlem" } },
          { "fodselsdato": "04.04.1982", "navn": "Mona Lund", "rolle": { "kode": "MEDL", "tekstforklaring": "Styremedlem" } }
        ],
        "tekstforklaring": "Styret i fellesskap"
      }
    ]
  },
  "status": {
    "kombinasjonStatus": { "kode": "OK", "tekstforklaring": "Kombinasjon finnes." },
    "regelStatus": { "kode": "RI", "tekstforklaring": "Regel er ikke registrert eller standardisert.", "regelIdent": null },
    "rutineStatus": { "kode": "OK", "tekstforklaring": "Maskinelt oppslag utført uten feil." }
  }
}
```

Field by field, translated:

- `enhet` ("entity"): the organisation, `navn` ("name") and `organisasjonsnummer` ("organisation number").
- `signeringsGrunnlag` ("signing basis"): `kode: "SF"` means a signing basis exists for this organisation (as opposed to `"SI"`, shown above).
- `muligeSigneringsRoller.personRolleGrunnlag` ("possible signing roles" / "person-role basis"): a flat list of everyone who holds a role that's *potentially* relevant. `fodselsdato` is date of birth (`DD.MM.YYYY`), `navn` is name, `rolle.kode`/`tekstforklaring` is the role, for example `DAGL` ("Daglig leder", managing director), `LEDE` ("Styrets leder", board chair), `MEDL` ("Styremedlem", board member). **This list alone does not tell you who can sign, or in what combination.**
- `signaturProkuraRoller.signaturProkuraFritekst`: a human-readable, free-text description of the actual rule, not something you can check programmatically.
- `signeringsKombinasjon.kombinasjon` ("signing combination"): this is the part that matters. Each entry is one complete, valid combination of signees, submitting all of them together, and only them, is what satisfies this combination.
  - `kode`: the combination's type, for example `STYR` ("styret", the board).
  - `personRolleKombinasjon`: the exact set of people required for this specific combination.
  - `tekstforklaring`: a human-readable description, for example `"Styret i fellesskap"` ("the board, jointly").
- `status.regelStatus`: whether BRREG could derive a clean, standardized rule. `"RI"` ("Regel er ikke registrert eller standardisert", rule not registered or standardized) means BRREG couldn't mechanically break the free-text rule down further, so it falls back to a single, safe combination, here, the entire board acting together, even though the free text hints that smaller combinations (for example, any two board members, or the managing director alone) might also be valid in reality. **Only the combinations actually listed under `kombinasjon` can be used for simulation, regardless of what the free text implies.**

### Submitting signees that match

To trigger automatic approval, `POST /v2/simulation/signatures` needs the exact set of people from one combination, no more, no fewer. Matching is done on full name (exact string match) and date of birth:

```json
{
  "orderId": "{orderId}",
  "signees": [
    { "fullName": "Ola Nordmann", "dateOfBirth": "1975-02-02", "email": "ola.nordmann@example.com" },
    { "fullName": "Per Hansen", "dateOfBirth": "1978-03-03", "email": "per.hansen@example.com" },
    { "fullName": "Mona Lund", "dateOfBirth": "1982-04-04", "email": "mona.lund@example.com" }
  ]
}
```

`dateOfBirth` is submitted as a normal ISO 8601 date, matching the API contract, there's no need to convert it to BRREG's `DD.MM.YYYY` format yourself, that happens on our end. `email` isn't checked against BRREG at all, it's only used to identify the signee within your own order.

Submitting a subset of a combination, an extra person added to one, or people who don't appear in any combination at all, will not match, and the order moves to `PENDING_BANK_RESPONSE` instead, see [Signatures Approved by Bank](./test_flows.md#signatures-approved-by-bank) and [Signatures Rejected by Bank](./test_flows.md#signatures-rejected-by-bank) for simulating what happens next.
