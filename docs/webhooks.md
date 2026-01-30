# Webhooks
This is how the webhook flow works:

1. When registering an order
    - Add a webhookUrl property to the register bax request payload ( `PUT /psp/v2/orders/new` )
    - Security measures
        - We expect the webhook callback URL to be an open endpoint
        - In case the integrator needs to whitelist our callback, the following IP addresses are used from our end:
            - Test environment: `51.13.44.137`
            - Prod environment: `51.13.52.185`
2. When the PSP calls the `PUT /psp/v2/orders/new` endpoint to register an agreement order, you will get an `orderId` in the response (as per the existing API spec).
   Whenever there is a change to the agreement order in our systems, we will do a POST call to the webhookUrl with the `orderId` in the request body, looking like this:
```
{
  "orderId": "af5505ad-4346-4c7e-8729-700bd0b92168",
  "orderStatus": "PENDING_BANK_RESPONSE"
}
```
where the `orderStatus` refers to the statuses defined in the [Possible Order Statuses](getting_started.md#possible-order-statuses)

3. The PSP should then call our existing endpoint to fetch the updated status ( `GET /psp/v2/orders/{orderId}` )
    - The `orderStatus` field in this response should give you the necessary information about the agreement registration order.


## Webhook example sequence diagram

```mermaid
sequenceDiagram
    participant Integrator
    participant Onboarding API
    participant Signees
    participant Bank
    Integrator->>Onboarding API: registerOrder (with webhook url)
    Onboarding API->>Integrator: POST webhook call (status change)
    Integrator->>Onboarding API: call order endpoint to get details
    Onboarding API->>Signees: email with signing link
    Signees->>Onboarding API: sign order
    Onboarding API->>Integrator: POST webhook call (status change)
    Integrator->>Onboarding API: call order endpoint to get details
    Onboarding API->>Bank: send order
    Bank->>Onboarding API: accepted
    Onboarding API->>Integrator: POST webhook call (status change)
    Integrator->>Onboarding API: call order endpoint to get details
```
