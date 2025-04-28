<p align="center">
<img alt="BankAxept_Logo.svg" src="../assets/images/bankaxept_logo.svg" width="300"/>
</p>

> Welcome to the Getting Started guide for the BankAxept
> Onboarding API.

# Introduction

This is an API for Norwegian [PSPs](dictionary.md) to register new [Bax numbers](dictionary.md) which are automatically assigned BankAxept products.
Following a merchant agreement registration request BankAxept will:

* Create a Bax number in [Baxbis](dictionary.md)
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

We validate the following information when registering an agreement: <br/>
**Account Ownership**: We validate that the account number belongs to the customer. <br/>
**Account Number**: We validate that the account number is valid and belongs to the customer. <br/>
**MCC**: We validate that the [MCC](dictionary.md) is valid and supported. You can find a list of supported MCCs in our [MCC documentation](./mcc_codes.md).

### Possible Order Statuses:

| Status               | Description                                                                                                   |
|----------------------|---------------------------------------------------------------------------------------------------------------|
| BAX_NOT_CREATED      | The agreement has been created in our system but does not yet have an associated [Bax number.](dictionary.md) |
| NOT_SIGNED           | The agreement has not been signed yet.                                                                        |
| SIGNED_AWAITING_BANK | The agreement has been signed by the customer and is waiting for the bank to approve the signatures.          |
| BAX_ACTIVE           | The agreement has been activated after the signatures have been approved.                                     |
| REJECTED             | The agreement has been rejected by the bank.                                                                  |

### Test 

Account numbers are validated during the registration process. <br/> The first four digits of the account number is always the [bank reg number.](dictionary.md) <br/>
We validate that the bank reg number is in our list of valid settlement banks. <br/> For the test environment you can use **7001** and **9710** as valid bank reg numbers. <br/>

#### Valid flow for Test: An order is created with and signed by the correct signee(s) and the signatures are automatically approved
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

#### Valid flow for Test: An order is created with and signed by signee(s) that can not be validated based on the info in [BRREG](dictionary.md) and the signatures are automatically rejected but then approved by the bank
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

#### Valid flow for Test: An order is created with and signed by signee(s) that can not be validated based on the info in [BRREG](dictionary.md) and the signatures are automatically rejected and later rejected by the bank
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

### Production

#### Valid flow for Production: An order is created with and signed by the correct signee(s) and the signatures are approved
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

#### Valid flow for Production: An order is created with and signed by the incorrect signee(s) and the signatures are rejected by the bank. 
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
note right of O: This will return the agreement details. <br/> After a few seconds it should result in <br/> REJECTED status with a reason for rejection and <br/> a BAX Number assuming the agreement was rejected by the bank
O -->> I: 200 OK with Agreement

note over I, O: Resend signing request on Agreement
I ->> O: PUT /agreement/{orderId}/resend-signing-email
note right of O: This is intended to be utilized if signing <br/> requirements change and need to be updated <br/> or if previous signature was rejected.

O -->> I: 202 Accepted
O ->> O: Send email to customer
```

## Webhooks

Description of how we envision the webhooks flow to look like.

1. Registering an agreement
    - Add a webhook URL parameter to the register agreement endpoint ( `PUT /psp/v2/register/merchantAgreement` )
    - Security measures
      - We expect the webhook callback URL to be an open endpoint
      - In case the integrator needs to whitelist our callback, the following IP addresses are used from our end:
        - Test environment: `51.13.44.137`
        - Prod environment: `51.13.52.185`
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


