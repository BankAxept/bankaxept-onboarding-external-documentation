<p align="center">
<img alt="BankAxept_Logo.svg" src="../assets/images/bankaxept_logo.svg" width="300"/>
</p>

> Welcome to the Getting Started guide for the BankAxept
> Onboarding API.

# Introduction

Onboarding lets you onboard Merchants.

## Setting up your Onboarding integration

There are multiple points of configuration that need to be aligned before you can fully utilize the Onboarding API. The necessary steps may be found in our
[Configuration Guide](./configuration.md).

## Integration Guidelines


### Valid flow for Production - Happy Path 
```mermaid
sequenceDiagram
participant Integrator
participant ONBOARDING_API

Integrator -> ONBOARDING_API: PUT Register agreement
ONBOARDING_API --> Integrator: 200 OK with OrderId
Integrator -> ONBOARDING_API : GET agreement/OrderId

note right of ONBOARDING_API: This will return the agreement details <br/> after a few seconds it should result in NOT_SIGNED state <br/> with a BAX Number
ONBOARDING_API --> Integrator: 200 OK with Agreement
note over Integrator, ONBOARDING_API: Verify signing of agreement
Integrator -> ONBOARDING_API: GET /awaiting signatures
ONBOARDING_API --> Integrator: 200 OK with all Agreements
Integrator -> ONBOARDING_API : GET agreement/OrderId
note right of ONBOARDING_API: This will return the agreement details <br/> after signing has been completed by the merchants  it should result in <br/> BAX_ACTIVE state with a BAX Number assuming <br/> the agreement was signed with valid signees
ONBOARDING_API --> Integrator: 200 OK with Agreement
```

### Valid flow for Production - Unhappy Path
```mermaid
sequenceDiagram
participant Integrator
participant ONBOARDING_API

Integrator -> ONBOARDING_API: PUT Register agreement
ONBOARDING_API --> Integrator: 200 OK with OrderId

Integrator -> ONBOARDING_API : GET agreement/OrderId
note right of ONBOARDING_API: This will return the agreement details <br/> after a few seconds it should result in NOT_SIGNED state <br/> with a BAX Number
ONBOARDING_API --> Integrator: 200 OK with Agreement
note over Integrator, ONBOARDING_API: Verify signing of agreement
Integrator -> ONBOARDING_API: GET /awaiting signatures
ONBOARDING_API --> Integrator: 200 OK with all Agreements
Integrator -> ONBOARDING_API : GET agreement/OrderId
note right of ONBOARDING_API: This will return the agreement details <br/> after a few seconds it should result in <br/> REJECTED state with a BAX Number assuming <br/> the agreement was signed with invalid signees
ONBOARDING_API --> Integrator: 200 OK with Agreement

note over Integrator, ONBOARDING_API: Resend signing request on Agreement
Integrator -> ONBOARDING_API: POST /resend-signing-email
note right of ONBOARDING_API: This is intended to be utilized if signing <br/> requirements change and need to be updated <br/> or if previous signature was rejected.

ONBOARDING_API --> Integrator: 202 Accepted
ONBOARDING_API -> ONBOARDING_API: Send email to customer
```

### Valid flow for Test - Happy Path
```mermaid
sequenceDiagram
participant Integrator
participant ONBOARDING_API

Integrator -> ONBOARDING_API: PUT Register agreement
note right of ONBOARDING_API: We validate: <br/> - Account Ownership <br/> - Account Number <br/> We provide the ability to bypass account ownership validation <br/> and provide more information on valid account numbers in our documentation
ONBOARDING_API --> Integrator: 200 OK with OrderId

Integrator -> ONBOARDING_API : GET agreement/OrderId
note right of ONBOARDING_API: This will return the agreement details <br/> after a few seconds it should result in <br/> NOT_SIGNED state with a BAX Number
ONBOARDING_API --> Integrator: 200 OK with Agreement
note over Integrator, ONBOARDING_API: Simulate signing of agreement
Integrator -> ONBOARDING_API: POST /simulate/signing
note right of ONBOARDING_API: You must send signee(s) that have signature rights <br/> based on the information in BRREG for the flow to <br/> continue following this diagram
ONBOARDING_API --> Integrator: 202 Accepted
Integrator -> ONBOARDING_API : GET agreement/OrderId
note right of OnBOARDING_API: This will return the agreement details <br/> after a few seconds it should result in <br/> BAX_ACTIVE state
ONBOARDING_API --> Integrator: 200 OK with Agreement
```

### Valid flow for Test - Unhappy Path bank approves
```mermaid
sequenceDiagram
participant Integrator
participant ONBOARDING_API

Integrator -> ONBOARDING_API: PUT Register agreement
note right of ONBOARDING_API: We validate: <br/> - Account Ownership <br/> - Account Number <br/> We provide the ability to bypass account ownership validation <br/> and provide more information on valid account numbers in our documentation
ONBOARDING_API --> Integrator: 200 OK with OrderId

Integrator -> ONBOARDING_API : GET agreement/OrderId
note right of ONBOARDING_API: This will return the agreement details <br/> after a few seconds it should result in <br/> NOT_SIGNED state with a BAX Number
ONBOARDING_API --> Integrator: 200 OK with Agreement
note over Integrator, ONBOARDING_API: Simulate signing of agreement
Integrator -> ONBOARDING_API: POST /simulate/signing
note right of ONBOARDING_API: You must send signee(s) that have signature rights <br/> based on the information in BRREG for the flow to <br/> continue following this diagram
ONBOARDING_API --> Integrator: 202 Accepted
Integrator -> ONBOARDING_API : GET agreement/OrderId
note right of ONBOARDING_API: This will return the agreement details <br/> after a few seconds it should result in <br/> SIGNED_AWAITING_BANK state
ONBOARDING_API --> Integrator: 200 OK with Agreement

note over Integrator, ONBOARDING_API: Simulate Bank Response on Agreement

Integrator -> ONBOARDING_API: POST /simulate/bank/approves/signatures

ONBOARDING_API --> Integrator: 202 Accepted
Integrator -> ONBOARDING_API : GET agreement/OrderId
note right of OnBOARDING_API: This will simulate the bank approving the signature(s) <br/> and should result in a BAX_ACTIVE state
ONBOARDING_API --> Integrator: 200 OK with Agreement
```

### Valid flow for Test - Unhappy Path bank rejects
```mermaid
sequenceDiagram
participant Integrator
participant ONBOARDING_API

Integrator -> ONBOARDING_API: PUT Register agreement
note right of ONBOARDING_API: We validate: <br/> - Account Ownership <br/> - Account Number <br/> We provide the ability to bypass account ownership validation <br/> and provide more information on valid account numbers in our documentation
ONBOARDING_API --> Integrator: 200 OK with OrderId

Integrator -> ONBOARDING_API : GET agreement/OrderId
note right of ONBOARDING_API: This will return the agreement details <br/> after a few seconds it should result in <br/> NOT_SIGNED state with a BAX Number
ONBOARDING_API --> Integrator: 200 OK with Agreement
note over Integrator, ONBOARDING_API: Simulate signing of agreement
Integrator -> ONBOARDING_API: POST /simulate/signing
note right of ONBOARDING_API: You must send signee(s) that have signature rights <br/> based on the information in BRREG for the flow to <br/> continue following this diagram
ONBOARDING_API --> Integrator: 202 Accepted
Integrator -> ONBOARDING_API : GET agreement/OrderId
note right of ONBOARDING_API: This will return the agreement details <br/> after a few seconds it should result in <br/> SIGNED_AWAITING_BANK state
ONBOARDING_API --> Integrator: 200 OK with Agreement

note over Integrator, ONBOARDING_API: Simulate Bank Response on Agreement

Integrator -> ONBOARDING_API: POST /simulate/bank/rejects/signatures

ONBOARDING_API --> Integrator: 202 Accepted
Integrator -> ONBOARDING_API : GET agreement/OrderId
note right of OnBOARDING_API: This will simulate the bank approving the signature(s) <br/> and should result in a REJECTED state
ONBOARDING_API --> Integrator: 200 OK with Agreement
```
