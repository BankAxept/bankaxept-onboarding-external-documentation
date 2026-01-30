# Valid flows for Production

## Automatically Approved Signatures
An order is created with and signed by the correct signee(s) and the signatures are approved
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new order
I ->> O: PUT /orders/new
O -->> I: 202 Accepted with orderId

note over I, O: Check status of an order
I ->> O : GET /orders/{orderId}
note right of O: This will return the order details. <br/> After a few seconds it should result in NOT_SIGNED status <br/> with a BAX Number
O -->> I: 200 OK with Order

note over I, O: Verify signing of an order
I ->> O: GET /orders?status=awaiting_signatures
O -->> I: 200 OK with all Orders awaiting signature

note over I, O: Check status of an order
I ->> O : GET /orders/{orderId}
note right of O: This will return the order details <br/> after signing has been completed by the merchants it should result in <br/> BAX_ACTIVE status with a BAX Number assuming <br/> the order was signed with valid signees
O -->> I: 200 OK with Order
```

## Signatures Rejected by Bank
An order is created with and signed by the incorrect signee(s) and the signatures are rejected by the bank.
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new order
I ->> O: PUT /orders/new
O -->> I: 202 Accepted with orderId

note over I, O: Check status of an order
I ->> O : GET /orders/{orderId}
note right of O: This will return the order details. <br/> After a few seconds it should result in NOT_SIGNED status <br/> with a BAX Number
O -->> I: 200 OK with Order

note over I, O: Verify signing of an order
I ->> O: GET /orders?status=awaiting_signatures
O -->> I: 200 OK with all Orders awaiting signature

note over I, O: Check status of an order
I ->> O : GET /orders/{orderId}
note right of O: This will return the order details. <br/> After a few seconds it should result in <br/> REJECTED_RECREATE_SIGNING status with a reason for rejection and <br/> a BAX Number assuming the order was rejected by the bank
O -->> I: 200 OK with Order

note over I, O: Resend signing request on an order
I ->> O: PUT /orders/{orderId}/signees
note right of O: This is intended to be utilized if signing <br/> requirements change and need to be updated <br/> or if previous signature was rejected.

O -->> I: 202 Accepted
O ->> O: Send email to customer
```
