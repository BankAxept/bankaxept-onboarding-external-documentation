# Known Error Patterns

The onboarding API implements [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html).

## Standard Response Fields

These standard fields are provided in most 4xx and 5xx `/v2/` error response bodies:

- **type** - URI which points an exception message to this page and more information
- **title** - The name of the problem
- **status** - A copy of the HTTP status

## Optional Fields

These fields are provided whenever possible. They are explicitly optional in the contract:

- **detail** -  Dynamic content related to the exception. For example, this could be individual validation errors. This is human readable and should not be parsed. 
- **instance** - The path portion of the request URI
- **correlationId** - A UUID generated and attached to each request at the start of our processing. Used to uniquely identify a single request in our systems

## Known Limitations

We do not provide RFC 9457 compliant error responses in the following circumstances:

- The request fails in the network stack before reaching the API
- The authorization layer does not support RFC 9457, so all 401/403 responses will be limited to standard HTTP responses.

## Example Response Payload

```json
{
  "type": "https://bankaxept.github.io/bankaxept-onboarding-external-documentation/problems/#bad-request",
  "title": "Bad Request",
  "status": 400,
  "detail": "The account number is invalid",
  "instance": "/psp/v2/orders/new",
  "correlationId": "5a75597e-3daf-4909-a123-d8a1d769d487"
}
```

---

## Problem Types

The following are valid problem types the application can return in the `ErrorResponse` type. When a specific problem type is reported, it will link back here. 

> **Note:** Changes to existing problem types is a breaking change.

The special type `about:blank` is the RFC 9457 standard catch-all "something went wrong" type. It does not link to this documentation and is used in rare cases.

### bad-request

A generic 400 bad request type. Most commonly returned when the request body fails validation. For example, a required field might be missing. Account numbers might adhere to the format specified in the contract, but fail additional validation rules inherent to the account number format itself that are difficult to express in an API contract.   

### constraint-violation

The request does not comply with the API contract. The `detail` field contains the specific constraints that fail validation.

### duplicate-message-id

The same message ID has been used with a different message body. Message IDs must be unique for each order. Returns HTTP 409 Conflict.

### internal-server-error

A generic 500 internal server error type.

### kar-failed

[KAR (Konto og adresseringsregister)](https://www.mastercardpaymentservices.com/norway/andre-tjenester/konto-og-adresseringsregister-kar/) is a service which we use to verify the ownership of the account.

This type is used when something goes wrong with the KAR service on our end. This might be a transient issue. This does not mean that the account ownership is wrong, only that we did not receive a proper response.

### not-found

A generic 404 not found type. This could also mean that the resource exists, but you are unauthorized to access it.

### unprocessable-content

A generic 422 HTTP response type. We are unable to process the request's content. Usually provided when the request body is valid according to the contract, but does not make sense in the real world. For example, the organization number is valid, does not belong to a real company. There could be more information in the `detail` field.

### unsupported-acquiring-bank

The settlement account in the order belongs to a bank which does not permit BankAxept to enter into an acquiring agreement on their behalf, and the customer does not already have an existing BankAxept acquiring agreement for the account number. You can use this type to route orders away from the Onboarding API.

**To be clear:** If the customer already has an acquiring agreement for BankAxept on the account number, we permit ordering even though the bank is unsupported.

> **Note:** We may add support for more banks at any time.
