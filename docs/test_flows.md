# Test flows

These diagrams show the API calls and [webhooks](./webhooks.md) for the main paths through the [Order Statuses Flowchart](./index.md#order-statuses-flowchart), using the simulation endpoints available in the test environment.
The remaining paths (for example bank deadline expiry or an order closed by BankAxept) behave as described in the [Production flows](./prod_flows.md).
Webhooks are shown where they are triggered. Delivery order is not guaranteed, see [Webhooks](./webhooks.md#delivery-and-ordering).
If you do not use webhooks, you can poll `GET /v2/orders/{orderId}` instead.
For how to construct valid bank identifiers, account numbers, BRREG organisations, and signees, see [Test Data](./test_data.md).

## Automatically Approved Signatures
An order is created with and signed by the correct signee(s) and the signatures are automatically approved. See [Signees](./test_data.md#signees) for how to construct a matching combination.
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new order
I ->> O: PUT /v2/orders/new
note right of O: We validate Account Ownership and Account Number
O -->> I: 202 Accepted with orderId

O --) I: POST webhookUrl {orderStatus: NOT_SIGNED}
I ->> O : GET /v2/orders/{orderId}
O -->> I: 200 OK with Order (NOT_SIGNED, Bax number)

note over I, O: Simulate signing of an order
I ->> O: POST /v2/simulation/signatures
note right of O: Send signee(s) that have signature rights
O -->> I: 202 Accepted

O --) I: POST webhookUrl {orderStatus: BAX_ACTIVE}
I ->> O : GET /v2/orders/{orderId}
O -->> I: 200 OK with Order (BAX_ACTIVE)
```

## Signatures Approved by Bank
An order is created with and signed by signee(s) that cannot be validated based on the info in [BRREG](dictionary.md) and the signatures are automatically rejected but then approved by the bank. See [Signees](./test_data.md#signees) for how BRREG signing combinations work.
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new order
I ->> O: PUT /v2/orders/new
note right of O: We validate Account Ownership and Account Number
O -->> I: 202 Accepted with orderId

O --) I: POST webhookUrl {orderStatus: NOT_SIGNED}
I ->> O : GET /v2/orders/{orderId}
O -->> I: 200 OK with Order (NOT_SIGNED, Bax number)

note over I, O: Simulate signing of an order
I ->> O: POST /v2/simulation/signatures
note right of O: Send signee(s) that do not have signature rights
O -->> I: 202 Accepted

O --) I: POST webhookUrl {orderStatus: PENDING_BANK_RESPONSE}
I ->> O : GET /v2/orders/{orderId}
O -->> I: 200 OK with Order (PENDING_BANK_RESPONSE)

note over I, O: Simulate the bank approving the signature(s)
I ->> O: POST /v2/simulation/orders/{orderId}/bank-decision
O -->> I: 202 Accepted

O --) I: POST webhookUrl {orderStatus: BAX_ACTIVE}
note right of O: BAX_ACTIVE is a short intermediate status <br/> before the order moves on to ACCEPTED
O --) I: POST webhookUrl {orderStatus: ACCEPTED}
I ->> O : GET /v2/orders/{orderId}
O -->> I: 200 OK with Order (ACCEPTED)
```

## Signatures Rejected by Bank
An order is created with and signed by signee(s) that cannot be validated based on the info in [BRREG](dictionary.md) and the signatures are automatically rejected and later rejected by the bank. See [Signees](./test_data.md#signees) for how BRREG signing combinations work.
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new order
I ->> O: PUT /v2/orders/new
note right of O: We validate Account Ownership and Account Number
O -->> I: 202 Accepted with orderId

O --) I: POST webhookUrl {orderStatus: NOT_SIGNED}
I ->> O : GET /v2/orders/{orderId}
O -->> I: 200 OK with Order (NOT_SIGNED, Bax number)

note over I, O: Simulate signing of an order
I ->> O: POST /v2/simulation/signatures
note right of O: Send signee(s) that do not have signature rights
O -->> I: 202 Accepted

O --) I: POST webhookUrl {orderStatus: PENDING_BANK_RESPONSE}
I ->> O : GET /v2/orders/{orderId}
O -->> I: 200 OK with Order (PENDING_BANK_RESPONSE)

note over I, O: Simulate the bank rejecting the signature(s)
I ->> O: POST /v2/simulation/orders/{orderId}/bank-decision
O -->> I: 202 Accepted

O --) I: POST webhookUrl {orderStatus: REJECTED_RECREATE_SIGNING}
I ->> O : GET /v2/orders/{orderId}
O -->> I: 200 OK with Order (REJECTED_RECREATE_SIGNING and reason for rejection)

note over I, O: Resend signing request on an order
I ->> O: PUT /v2/orders/{orderId}/signees
note right of O: Use this if signing requirements change <br/> or if the previous signature was rejected.
O -->> I: 202 Accepted
O ->> O: Send email to customer
O --) I: POST webhookUrl {orderStatus: NOT_SIGNED}
```
