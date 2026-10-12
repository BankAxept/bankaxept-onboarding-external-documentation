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

This call is idempotent: it sets the bypass to the value you provide, regardless of its previous state. The setting applies to the authenticated API client as a whole, not to an individual order or request. There is no automatic expiry or reset, and no way to scope it to a single order; it stays in effect until someone explicitly changes it again. If you share test credentials with other people or systems, for example other developers on your team, changing this setting changes behavior for all of them too, every order anyone registers using that client is affected. Set it back to `false` if you want to test the [KAR](dictionary.md) implementation itself using an organisation and account number pair with genuine, legal ownership between them, see [Customers](#customers) for how to obtain one.

This endpoint, like the rest of `/psp/v2/simulation/*`, only exists in the test environment.

## Customers

Test, like production, validates customers against [BRREG](dictionary.md), so any active Norwegian organisation can be used as test data. Use [BRREG's public lookup](https://virksomhet.brreg.no) to search for one by name and use its organisation number. Any active result works. There's no fixed or recommended set; searching for your own company name or any term relevant to your testing works just as well as anything else.

### Combining BRREG customers with generated account numbers

A real organisation from BRREG has no actual, legal ownership relationship with an account number you generate using [Valid Account Numbers](./valid_account_numbers.md). [KAR](dictionary.md) will not show them as belonging to each other. Registering an order with this combination fails account ownership validation unless you also enable [Bypassing Account Ownership Validation](#bypassing-account-ownership-validation).

To construct a complete, valid test order from scratch, you need:

1. A real organisation number from BRREG.
2. A generated account number for a known bank identifier. See [Banks](#banks) and [Valid Account Numbers](./valid_account_numbers.md).
3. `bypassAccountOwnershipCheck: true`, since the organisation doesn't actually, legally own the account.

If you instead want to test the [KAR](dictionary.md) implementation itself rather than bypass it, you need an organisation and account number with genuine, legal ownership between them, which KAR has data for. This isn't something you can construct arbitrarily. Contact BankAxept if you need such a pairing for testing.
