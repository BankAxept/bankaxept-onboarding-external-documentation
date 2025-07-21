# Onboarding

## Getting credentials
In order to use the Onboarding API, you will need to obtain client credentials from BankAxept. 
Please get in touch with your partner contact to obtain the necessary credentials.
You will need separate credentials for the test and production environments.


## Getting an access token
All requests to the Onboarding API must include an access token in the Authorization header. To get an access token
you must make a request to the `/token` endpoint with your client credentials as specified in the [OAuth 2.0 specification](https://datatracker.ietf.org/doc/html/rfc6749#section-4.4.2).
The request should contain an authorization header using the Basic authentication scheme, i.e. base64 encode the string `client_id:client_secret` and include it in the header.
The following is an example request using a client ID of `client-id` and a client secret of `client-secret`:

```http
POST https://sso.test.stoe.no/auth/realms/external/protocol/openid-connect/token
     Authorization: Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ=
     Content-Type: application/x-www-form-urlencoded

     grant_type=client_credentials
```

The response will contain an access token that you can use to authenticate your requests to the Onboarding API. The access token is a JSON Web Token (JWT) and will look something like this:

```json
{
  "access_token": "access-token-example",
  "expires_in": 300,
  "refresh_expires_in": 0,
  "token_type": "Bearer",
  "not-before-policy": 0,
  "scope": ""
}
```

The URL for the token endpoint is different for the test and production environments:
- **Test environment**: `https://sso.test.stoe.no/auth/realms/external/protocol/openid-connect/token`
- **Production environment**: `https://sso.stoe.no/auth/realms/external/protocol/openid-connect/token`

## Sending requests
All requests to the Onboarding API must include the access token in the Authorization header. We recommend requesting a
new token for each request as they have an expiry time of **five minutes**. The header should look like this:

```
Authorization: Bearer access-token-example
```
