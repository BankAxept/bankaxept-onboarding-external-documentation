<p align="center">
<img alt="BankAxept_Logo.svg" src="../assets/images/bankaxept_logo.svg" width="300"/>
</p>

> Welcome to the Getting Started guide for the BankAxept
> DES Onboard API.

# Introduction

Onboarding lets you onboard Merchants.

## Setting up your Onboarding integration

There are multiple points of configuration that need to be aligned before you can fully utilize the DES Issuer API. The necessary steps may be found in our
[Onboarding Guide](./onboarding.md).

## Integration Guidelines

```mermaid
sequenceDiagram
participant Integrator
participant ONBOARDING_API

Integrator -> ONBOARDING_API: PUT Register agreemeent
ONBOARDING_API --> Integrator: 200 OK with OrderId
Integrator -> ONBOARDING_API : GET agreement/OrderId

note right of ONBOARDING_API: This will return the agreement details after <br/> a few seconds it should result in NOT_SIGNED state <br/> with a BAX Number
ONBOARDING_API --> Integrator: 200 OK with Agreement
Integrator -> ONBOARDING_API: GET /awaiting signatures
ONBOARDING_API --> Integrator: 200 OK with all Agreements
Integrator -> ONBOARDING_API : GET agreement/OrderId
note right of ONBOARDING_API: This will return the agreement details <br/> after signing has been completed by the merchants  it should result in <br/> BAX_ACTIVE state with a BAX Number assuming <br/> the agreement was signed with valid signees
ONBOARDING_API --> Integrator: 200 OK with Agreement

```
