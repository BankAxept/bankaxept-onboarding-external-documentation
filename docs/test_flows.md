# Valid flows for Test

## Automatically Approved Signatures
An order is created with and signed by the correct signee(s) and the signatures are automatically approved
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new order
I ->> O: PUT /orders/new
note right of O: We validate: Account Ownership and Account Number. <br/> We provide the ability to bypass account ownership validation <br/> and more information regarding valid account numbers <br/> can be found in our documentation
O -->> I: 202 OK with orderId

note over I, O: Check status of an order
I ->> O : GET /orders/{orderId}
note right of O: This will return the order details. <br/> After a few seconds it should result in NOT_SIGNED status <br/> with a BAX Number
O -->> I: 200 OK with Order

note over I, O: Simulate signing of an order
I ->> O: POST /simulation/signatures
note right of O: You must send signee(s) that have signature rights <br/> based on the information in BRREG for the flow to <br/> continue following this diagram
O -->> I: 202 Accepted

note over I, O: Check status of an order
I ->> O : GET /orders/{orderId}
note right of O: This will return the order details. <br/> After a few seconds it should result in <br/> BAX_ACTIVE status
O -->> I: 200 OK with Order
```

## Signatures Approved by Bank
An order is created with and signed by signee(s) that can not be validated based on the info in [BRREG](dictionary.md) and the signatures are automatically rejected but then approved by the bank
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new order
I ->> O: PUT /orders/new
note right of O: We validate: Account Ownership and Account Number. <br/> We provide the ability to bypass account ownership validation <br/> and more information regarding valid account numbers <br/> can be found in our documentation
O -->> I: 202 OK with orderId

note over I, O: Check status of an order
I ->> O : GET /orders/{orderId}
note right of O: This will return the order details. <br/> After a few seconds it should result in NOT_SIGNED status <br/> with a BAX Number
O -->> I: 200 OK with Order

note over I, O: Simulate signing of an order
I ->> O: POST /simulation/signatures
note right of O: You must send signee(s) that have signature rights <br/> based on the information in BRREG for the flow to <br/> continue following this diagram
O -->> I: 202 Accepted

note over I, O: Check status of an order
I ->> O : GET /orders/{orderId}
note right of O: This will return the order details. <br/> After a few seconds it should result in <br/> SIGNED_AWAITING_BANK status
O -->> I: 200 OK with Order

note over I, O: Simulate Bank Response on an Order
I ->> O: POST /simulation/orders/{orderId}/bank-decision
O -->> I: 202 Accepted

note over I, O: Check status of an order
I ->> O : GET /orders/{orderId}
note right of O: This will simulate the bank approving the signature(s) <br/> and should result in ACCEPTED status
O -->> I: 200 OK with Order
```

## Signatures Rejected by Bank
An order is created with and signed by signee(s) that can not be validated based on the info in [BRREG](dictionary.md) and the signatures are automatically rejected and later rejected by the bank
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new order
I ->> O: PUT /orders/new
note right of O: We validate: Account Ownership and Account Number. <br/> We provide the ability to bypass account ownership validation <br/> and more information regarding valid account numbers <br/> can be found in our documentation
O -->> I: 202 OK with orderId

note over I, O: Check status of an order
I ->> O : GET /orders/{orderId}
note right of O: This will return the order details. <br/> After a few seconds it should result in NOT_SIGNED status <br/> with a BAX Number
O -->> I: 200 OK with Order

note over I, O: Simulate signing of an order
I ->> O: POST /simulation/signatures
note right of O: You must send signee(s) that do not have signature rights <br/> based on the information in BRREG for the flow to <br/> continue following this diagram
O -->> I: 202 Accepted

note over I, O: Check status of an order
I ->> O : GET /orders/{orderId}
note right of O: This will return the order details. <br/> After a few seconds it should result in <br/> SIGNED_AWAITING_BANK status
O -->> I: 200 OK with Order

note over I, O: Simulate Bank Response on an Order
I ->> O: POST /simulation/orders/{orderId}/bank-decision
O -->> I: 202 Accepted

note over I, O: Check status of an order
I ->> O : GET /orders/{orderId}
note right of O: This will simulate the bank rejecting the signature(s) <br/> and should result in a REJECTED_RECREATE_SIGNING status with a reason for rejection
O -->> I: 200 OK with Order

note over I, O: Resend signing request on an order
I ->> O: PUT /orders/{orderId}/signees
note right of O: This is intended to be utilized if signing <br/> requirements change and need to be updated <br/> or if previous signature was rejected.

O -->> I: 202 Accepted
O ->> O: Send email to customer
```
