# Valid flows for Production

## Automatically Approved Signatures
An order is created with and signed by the correct signee(s) and the signatures are approved
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new agreement
I ->> O: PUT /register/merchantAgreement
O -->> I: 200 OK with orderId

note over I, O: Check status of agreement
I ->> O : GET /agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in NOT_SIGNED status <br/> with a BAX Number
O -->> I: 200 OK with Agreement

note over I, O: Verify signing of agreement
I ->> O: GET /agreement/awaiting-signature
O -->> I: 200 OK with all Agreements

note over I, O: Check status of agreement
I ->> O : GET agreement/{orderId}
note right of O: This will return the agreement details <br/> after signing has been completed by the merchants it should result in <br/> BAX_ACTIVE status with a BAX Number assuming <br/> the agreement was signed with valid signees
O -->> I: 200 OK with Agreement
```

## Signatures Rejected by Bank
An order is created with and signed by the incorrect signee(s) and the signatures are rejected by the bank.
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new agreement
I ->> O: PUT /register/merchantAgreement
O -->> I: 200 OK with orderId

note over I, O: Check status of agreement
I ->> O : GET /agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in NOT_SIGNED status <br/> with a BAX Number
O -->> I: 200 OK with Agreement

note over I, O: Verify signing of agreement
I ->> O: GET /agreement/awaiting-signature
O -->> I: 200 OK with all Agreements

note over I, O: Check status of agreement
I ->> O : GET /agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> REJECTED_RECREATE_SIGNING status with a reason for rejection and <br/> a BAX Number assuming the agreement was rejected by the bank
O -->> I: 200 OK with Agreement

note over I, O: Resend signing request on Agreement
I ->> O: PUT /agreement/{orderId}/resend-signing-email
note right of O: This is intended to be utilized if signing <br/> requirements change and need to be updated <br/> or if previous signature was rejected.

O -->> I: 202 Accepted
O ->> O: Send email to customer
```
