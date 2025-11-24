[# Known error patterns 

The onboarding API implements RFC 9457 with three optional extension fields.

These standard fields are provided in most 4xx and 5xx /v2/ error response bodies.

- type - URI which points an exception message to this page and more information.
- title - The name of the problem.
- status - A copy of the HTTP status.

These optional extension fields are commonly provided.

- detail - More dynamic content related to the exception. F.ex this could be individual validation errors.
- instance - The path portion of the request URI. 
- correlationId - A UUID generated at the beginning of each request to uniquely identify a single request in our systems. 

Known exceptions where we do not provide RFC 9457 compliant error responses:

- The request fails in the network stack before reaching the API. 
- The authorization layer does not support RFC 9457 so all 401/403 responses will be limited to standard HTTP responses. This will hopefully be fixed at some point.

The following are valid problem types the application can return in the ErrorResponse type.
When a specific problem type is reported it will link back here. Changes to existing problem types is a breaking change. 

## about:blank

This is the catch-all something went wrong type. This is provided when a more specific error type does not exist.

## bad-request

A generic 400 bad request type.

## constraint-violation

The request does not comply with the API-contract. The detail field contains the specific constraints that fails validation.  

## duplicate-message-id

The same message id has been used with a different message body. Message ids must be unique for each order. 

## internal-server-error

A generic 500 internal server error type. 

## kar-service-failed

Catch all for something going wrong with the KAR-service on our end. Might be a transient issue. This does not mean that the validation has failed.  

## merchant-not-found

The provided organisation number is not a BankAxept customer.

## not-found

A generic 404 not found type slightly more specific than about:blank. This could also mean that the resource exists, but you are unauthorized to access it. 

## order-not-found

Similar to not-found, but specific to orders

## unprocessable-entity

A generic 422 http response type, we are unable to process the request. There could be more information in the details.

## unsupported-acquiring-bank

The settlement account in the order belongs to a bank which does not permit BankAxept to enter into an acquiring agreement on their behalf.
And the customer does not already have an existing BankAxept acquiring agreement for the account number. You can use this type to route orders away from the Onboarding API.

To be clear: If the customer has an acquiring agreement for BankAxept on the account number we permit ordering even though the bank is unsupported.

We may add support for more banks at any time.
