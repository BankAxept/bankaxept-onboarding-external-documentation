# Valid flows for Test

## Automatically Approved Signatures
An order is created with and signed by the correct signee(s) and the signatures are automatically approved
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new agreement
I ->> O: PUT /register/merchantAgreement
note right of O: We validate: Account Ownership and Account Number. <br/> We provide the ability to bypass account ownership validation <br/> and more information regarding valid account numbers <br/> can be found in our documentation
O -->> I: 200 OK with orderId

note over I, O: Check status of agreement
I ->> O: GET /agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> NOT_SIGNED status with a BAX Number
O -->> I: 200 OK with Agreement

note over I, O: Simulate signing of agreement
I ->> O: POST /simulate/signing
note right of O: You must send signee(s) that have signature rights <br/> based on the information in BRREG for the flow to <br/> continue following this diagram
O -->> I: 202 Accepted

note over I, O: Check status of agreement
I ->> O: GET /agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> BAX_ACTIVE status
O -->> I: 200 OK with Agreement
```

## Signatures Approved by Bank
An order is created with and signed by signee(s) that can not be validated based on the info in [BRREG](dictionary.md) and the signatures are automatically rejected but then approved by the bank
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new agreement
I ->> O: PUT /register/merchantAgreement
note right of O: We validate: Account Ownership and Account Number. <br/> We provide the ability to bypass account ownership validation <br/> and more information regarding valid account numbers <br/> can be found in our documentation
O -->> I: 200 OK with orderId

note over I, O: Check status of agreement
I ->> O: GET /agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> NOT_SIGNED status with a BAX Number
O -->> I: 200 OK with Agreement

note over I, O: Simulate signing of agreement
I ->> O: POST /simulate/signing
note right of O: You must send signee(s) that have signature rights <br/> based on the information in BRREG for the flow to <br/> continue following this diagram
O -->> I: 202 Accepted

note over I, O: Check status of agreement
I ->> O: GET /agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> SIGNED_AWAITING_BANK status
O -->> I: 200 OK with Agreement

note over I, O: Simulate Bank Response on Agreement
I ->> O: POST /simulate/bank/approves/signatures
O -->> I: 202 Accepted

note over I, O: Check status of agreement
I ->> O: GET /agreement/{orderId}
note right of O: This will simulate the bank approving the signature(s) <br/> and should result in a BAX_ACTIVE status
O -->> I: 200 OK with Agreement
```

## Signatures Rejected by Bank
An order is created with and signed by signee(s) that can not be validated based on the info in [BRREG](dictionary.md) and the signatures are automatically rejected and later rejected by the bank
```mermaid
sequenceDiagram
participant I as Integrator
participant O as Onboarding API

note over I, O: Register new agreement
I ->> O: PUT /register/merchantAgreement
note right of O: We validate: Account Ownership and Account Number. <br/> We provide the ability to bypass account ownership validation <br/> and more information regarding valid account numbers <br/> can be found in our documentation
O -->> I: 200 OK with orderId

note over I, O: Check status of agreement
I ->> O: GET /agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> NOT_SIGNED status with a BAX Number
O -->> I: 200 OK with Agreement

note over I, O: Simulate signing of agreement
I ->> O: POST /simulate/signing
note right of O: You must send signee(s) that do not have signature rights <br/> based on the information in BRREG for the flow to <br/> continue following this diagram
O -->> I: 202 Accepted

note over I, O: Check status of agreement
I ->> O: GET /agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> SIGNED_AWAITING_BANK status
O -->> I: 200 OK with Agreement

note over I, O: Simulate Bank Response on Agreement
I ->> O: POST /simulate/bank/rejects/signatures
O -->> I: 202 Accepted

note over I, O: Check status of agreement
I ->> O: GET /agreement/{orderId}
note right of O: This will simulate the bank rejecting the signature(s) <br/> and should result in a REJECTED status with a reason for rejection
O -->> I: 200 OK with Agreement

note over I, O: Resend signing request on Agreement
I ->> O: PUT /agreement/{orderId}/resend-signing-email
note right of O: This is intended to be utilized if signing <br/> requirements change and need to be updated <br/> or if previous signature was rejected.

O -->> I: 202 Accepted
O ->> O: Send email to customer
```
