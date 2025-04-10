<p align="center">
<img alt="BankAxept_Logo.svg" src="../assets/images/bankaxept_logo.svg" width="300"/>
</p>

> Welcome to the Getting Started guide for the BankAxept
> Onboarding API.

# Introduction

This is an API for Norwegian PSPs to register new Bax numbers which are automatically assigned BankAxept products.
Following a merchant agreement registration request BankAxept will:

* Create a Bax number in Baxbis
* Create a financial agreement document between the issuing bank and the customer, if needed.
* Create an agreement between BankAxept and the customer, if needed.
* Collect any necessary signature(s) using the signee and contact information provided in the request.

Bax numbers are loaded onto payment terminals in order to connect them to the payment network.
Baxbis is the system operated by Nets which issues bax numbers and
maintains the network necessary for payment terminals to work.

## Setting up your Onboarding integration

There are multiple points of configuration that need to be aligned before you can fully utilize the Onboarding API. The necessary steps may be found in our
[Configuration Guide](./configuration.md).

## Integration Guidelines


### Valid flow for Production - Happy Path 
```mermaid
sequenceDiagram
participant I as Integrator
participant O as ONBOARDING_API

I ->> O: PUT Register agreement
O -->> I: 200 OK with orderId
I ->> O : GET agreement/{orderId}

note right of O: This will return the agreement details. <br/> After a few seconds it should result in NOT_SIGNED state <br/> with a BAX Number
O -->> I: 200 OK with Agreement
note over I, O: Verify signing of agreement
I ->> O: GET /awaiting-signatures
O -->> I: 200 OK with all Agreements
I ->> O : GET agreement/{orderId}
note right of O: This will return the agreement details <br/> after signing has been completed by the merchants it should result in <br/> BAX_ACTIVE state with a BAX Number assuming <br/> the agreement was signed with valid signees
O -->> I: 200 OK with Agreement
```

### Valid flow for Production - Unhappy Path
```mermaid
sequenceDiagram
participant I as Integrator
participant O as ONBOARDING_API

I ->> O: PUT Register agreement
O -->> I: 200 OK with orderId

I ->> O : GET agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in NOT_SIGNED state <br/> with a BAX Number
O -->> I: 200 OK with Agreement
note over I, O: Verify signing of agreement
I ->> O: GET /awaiting-signatures
O -->> I: 200 OK with all Agreements
I ->> O : GET agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> REJECTED state with a BAX Number assuming <br/> the agreement was signed with invalid signees
O -->> I: 200 OK with Agreement

note over I, O: Resend signing request on Agreement
I ->> O: POST /resend-signing-email
note right of O: This is intended to be utilized if signing <br/> requirements change and need to be updated <br/> or if previous signature was rejected.

O -->> I: 202 Accepted
O ->> O: Send email to customer
```

### Valid flow for Test - Happy Path
```mermaid
sequenceDiagram
participant I as Integrator
participant O as ONBOARDING_API

I ->> O: PUT Register agreement
note right of O: We validate: Account Ownership and Account Number. <br/> We provide the ability to bypass account ownership validation <br/> and more information regarding valid account numbers <br/> can be found in our documentation
O -->> I: 200 OK with orderId

I ->> O: GET agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> NOT_SIGNED state with a BAX Number
O -->> I: 200 OK with Agreement
note over I, O: Simulate signing of agreement
I ->> O: POST /simulate/signing
note right of O: You must send signee(s) that have signature rights <br/> based on the information in BRREG for the flow to <br/> continue following this diagram
O -->> I: 202 Accepted
I ->> O : GET agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> BAX_ACTIVE state
O -->> I: 200 OK with Agreement
```

### Valid flow for Test - Unhappy Path bank approves
```mermaid
sequenceDiagram
participant I as Integrator
participant O as ONBOARDING_API

I ->> O: PUT Register agreement
note right of O: We validate: Account Ownership and Account Number. <br/> We provide the ability to bypass account ownership validation <br/> and more information regarding valid account numbers <br/> can be found in our documentation
O -->> I: 200 OK with orderId

I ->> O: GET agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> NOT_SIGNED state with a BAX Number
O -->> I: 200 OK with Agreement
note over I, O: Simulate signing of agreement
I ->> O: POST /simulate/signing
note right of O: You must send signee(s) that have signature rights <br/> based on the information in BRREG for the flow to <br/> continue following this diagram
O -->> I: 202 Accepted
I ->> O: GET agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> SIGNED_AWAITING_BANK state
O -->> I: 200 OK with Agreement

note over I, O: Simulate Bank Response on Agreement

I ->> O: POST /simulate/bank/approves/signatures

O -->> I: 202 Accepted
I ->> O: GET agreement/{orderId}
note right of O: This will simulate the bank approving the signature(s) <br/> and should result in a BAX_ACTIVE state
O -->> I: 200 OK with Agreement
```

### Valid flow for Test - Unhappy Path bank rejects
```mermaid
sequenceDiagram
participant I as Integrator
participant O as ONBOARDING_API

I ->> O: PUT Register agreement
note right of O: We validate: Account Ownership and Account Number. <br/> We provide the ability to bypass account ownership validation <br/> and more information regarding valid account numbers <br/> can be found in our documentation
O -->> I: 200 OK with orderId

I ->> O: GET agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> NOT_SIGNED state with a BAX Number
O -->> I: 200 OK with Agreement
note over I, O: Simulate signing of agreement
I ->> O: POST /simulate/signing
note right of O: You must send signee(s) that have signature rights <br/> based on the information in BRREG for the flow to <br/> continue following this diagram
O -->> I: 202 Accepted
I ->> O: GET agreement/{orderId}
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> SIGNED_AWAITING_BANK state
O -->> I: 200 OK with Agreement

note over I, O: Simulate Bank Response on Agreement

I ->> O: POST /simulate/bank/rejects/signatures

O -->> I: 202 Accepted
I ->> O: GET agreement/{orderId}
note right of O: This will simulate the bank rejecting the signature(s) <br/> and should result in a REJECTED state
O -->> I: 200 OK with Agreement

note over I, O: Resend signing request on Agreement
I ->> O: POST /resend-signing-email
note right of O: This is intended to be utilized if signing <br/> requirements change and need to be updated <br/> or if previous signature was rejected.

O -->> I: 202 Accepted
O ->> O: Send email to customer
```


## Webhooks

Description of how we envision the webhooks flow to look like.

1. Registering an agreement
    - Add a webhook URL parameter to the register agreement endpoint ( `PUT /psp/v2/register/merchantAgreement` )
    - Optionally we could also get an authentication token which will be put in the header when calling the webhook to ensure the call came from us and not an attacker.
    - This URL can be an open endpoint, or other security measures must be discussed.
2. When the PSP calls the `PUT /psp/v2/register/merchantAgreement` endpoint to register an agreement order, you will get an `orderId` in the response (as per the existing API spec).
   Whenever there is a change to the agreement order in our systems, we will call the webhook URL with the `orderId` in the request body, looking like this:
```
{
  "orderId": "af5505ad-4346-4c7e-8729-700bd0b92168"
}
```
3. The PSP should then call our existing endpoint to fetch the updated status ( `GET /psp/v2/register/{orderId}` )
    - The `registerMerchantOrderStatus` field in this response should give you the necessary information about the agreement registration order.


### Webhook example sequence diagram

```mermaid
sequenceDiagram
    participant Integrator
    participant ONBOARDING_API
    participant Signees
    participant Bank
    Integrator->>ONBOARDING_API: registerAgreement (with webhook url)
    ONBOARDING_API->>Integrator: webhook call (status change)
    Integrator->>ONBOARDING_API: call agreement endpoint to get details
    ONBOARDING_API->>Signees: email with signing link
    Signees->>ONBOARDING_API: sign agreement
    ONBOARDING_API->>Integrator: webhook call (status change)
    Integrator->>ONBOARDING_API: call agreement endpoint to get details
    ONBOARDING_API->>Bank: send agreement
    Bank->>ONBOARDING_API: accepted
    ONBOARDING_API->>Integrator: webhook call (status change)
    Integrator->>ONBOARDING_API: call agreement endpoint to get details
```


