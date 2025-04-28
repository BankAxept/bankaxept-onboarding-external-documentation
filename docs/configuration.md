# Onboarding

## Getting credentials
In order to create a JWT you need a private key and an issuer id. The private key is a 2048-bit RSA key. **_The private
key must be kept secret within the PSP organization._**

### Production/Test credentials

Production and test credentials are kept separate. You will need one set of credentials for each environment. This means
that you will need 2 key pairs. One for production and one for test.

### Creating a private key

Using openssl these commands create a 2048-bit RSA key and a public key in the correct format to send to
your partner contact in BankAxept:

```bash
# Generate a private key using PKCS#8 format, note that there is no encryption on the private key.
openssl genrsa 2048 | openssl pkcs8 -topk8 -out rsa_key.pem -nocrypt
# Extract the public key
openssl rsa -in rsa_key.pem -pubout -out rsa_key.pub
# Jose4j used in the Java example below supports DER encoded keys, this converts the private key to DER format
openssl pkcs8 -topk8 -inform PEM -outform DER -in rsa_key.pem -out rsa_key.der -nocrypt
```

### Getting an issuer id

Once BankAxept receives the public key from the above step, we will use it to create a user in our system and attach it
to an issuer id. This issuer id is then returned to you connecting your private key to your user in our system.

## Sending requests

In order to send requests you need a valid signed JWT. A valid JWT consists of an issuer,
an expiry time and, if it is a POST/PUT request it must have a request body.
They are signed with your private key and we verify the signature with your public key.
This is what an example PUT request looks like:
```
PUT https://onboarding-test.baxlab.no/psp/v2/simulate/bank/reject/signatures
content-type: application/json
        
eyJhbGciOiJSUzI1NiJ9.ewogICJpc3MiIDogIjEzMzc2NiIsCiAgImV4cCIgOiAxNzQyODMwOTM3LAogICJyZXF1ZXN0IiA6IHsKICAgICJvcmRlcklkI
iA6ICI2YTlmZjBmYi0zMzQxLTRlNzEtYmJjYS0wYzFkZmEyNzlhYWIiCiAgfQp9.EMMLEcNrk9BfrgQK2as4sXZzlTFajcIs5E15Poz52IHrwtB_f76CJ
ilwnptYwKj-XQVbJ89UJ7gTZsI3zwb97rJsCIZOTnqoE0X2xcYtUduw_LeyJbyajgBtq2U9L63f393R5Nc4StfiIo__R_7u-swC4lFq1wrethXh4Cpei1
1baftfzoJPGlvMjF-N6KFjTPL4IoP7OQX5QDht2kgZjz5jNbYVuXmTULAlxtVGyyL6zUpNQBsKwDqivUrNrhfa4tNynT9uPdSBux4KUxkjhDva-H_ILIy
piLl4_9-UzkJHXS5xkee5Wr7p5CeTh58nIhdboBLgdKIJ1a1chc8TQw
```
The above example has the following payload:
```
{
  "iss": "133766",
  "exp": 1742830937,
  "request": {
    "orderId": "6a9ff0fb-3341-4e71-bbca-0c1dfa279aab"
  }
}
```
The request has content-type application/json. If you go to
[jwt.io](https://jwt.io) and paste the JWT you will see that the "request" part of the JWT is a JSON object.
**_The examples provided below will not work unless they are encapsulated in a JWT._**


For GET requests the JWT should be included in the Authorization header. There is no "request".
```
GET https://onboarding-test.baxlab.no/psp/v2/register/4089d5b9-acdb-4469-9543-0bfda06c9d21
Accept: application/json
Authorization: eyJhbGciOiJSUzI1NiJ9.ewogICJpc3MiIDogIjEzNzg2OSIsCiAgImV4cCIgOiAxNzQzMDAwNTE0Cn0.N2q33h9jMPPUcB40jr27XV
_vtBwrHLQQjoENb56HDueoXVJMdoOKfiODhO_0wDbCc5IbTny8N1Bsr-htCHNAdo5v3lv8a1AzmvaPktMbLlGc69ypNuG8g2UyLiB4bsmgMFat2zPO0VS
wAdGLK3l8GDBhrpX76MN0O3QuGQPs0-1gbobrd-b5WOg-UJn7zXUGjDa9GTgaDhzNk59GA76rO67cNsrWZzlLIouRGS4_RzapQ6-W28-pj5p_WKukD6Ap
CAHMms9hVJkzbXF1vej_h9dzKxMcBelT5Xmeh0uFV9x8KNeuSw5o3Zse-tXxbcbPiN3owwUGSp5UpDmNYpV_3g
```
If you look at this JWT in [jwt.io](https://jwt.io) you will see that the "request" part is now missing,
leaving the expiry time, issuer and signature.

### Expiry time

In production we allow a maximum of 1 minute. In test we allow a maximum of 60 minutes.

### Creating a JWT

When you have a private key and a issuer id you can create a JWT. The JWT should be signed with the private key and
contain the issuer id and an expiry time. If it is a POST/PUT request it should also contain the request body.

#### Bash example
Example of how to create a JWT with [jq](https://jqlang.github.io/jq/):
```bash
user_id=<user_id>
expiration_time=<expiration_time>
request=<request>
private_key=<path_to_private_key>

header=$(echo -n '{"alg":"RS256","typ":"JWT"}' | base64 | tr '+/' '-_' | tr -d '=')
payload=$(jq -n --arg uid "$user_id" --argjson exp "$expiration_time" --argjson req "$request" '{
                iss: $uid,
                exp: $exp,
                request: $req
            }' | base64 | tr '+/' '-_' | tr -d '=')
signature=$(echo -n "${header}.${payload}" | openssl dgst -sha256 -sign "$private_key"
| base64 | tr '+/' '-_' | tr -d '=')
echo "${header}.${payload}.${signature}"
```

#### Java example

An example creating a JWT for a POST/PUT request with a private key in a file called testKey.der.
Using [jose4j](https://mvnrepository.com/artifact/org.bitbucket.b_c/jose4j) and the ObjectMapper from Jackson:

```java
  public String createJWTForPost(String userId, Object request) throws Exception {
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new Jdk8Module());
    objectMapper.registerModule(new JavaTimeModule());

    ObjectWriter ow = objectMapper.writer().withDefaultPrettyPrinter();

    JwtClaims claims = new JwtClaims();
    claims.setIssuer(userId);
    claims.setExpirationTimeMinutesInTheFuture(60);
    claims.setClaim("request", request);

    JsonWebSignature jws = new JsonWebSignature();
    jws.setPayload(ow.writeValueAsString(claims.getClaimsMap()));
    jws.setAlgorithmHeaderValue(AlgorithmIdentifiers.RSA_USING_SHA256);
    URL resource = getClass().getClassLoader().getResource("testKey.der");
    byte[] keyBytes = Files.readAllBytes(Paths.get(resource.toURI()));

    PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);

    KeyFactory factory = KeyFactory.getInstance("RSA");
    jws.setKey(factory.generatePrivate(spec));

    return jws.getCompactSerialization();
  }
```

Omitting 'claims.setClaim("request", request);' will result in a JWT valid for a GET request instead.


## Validation

We validate all tokens. An invalid token will result in a 401 Unauthorized response. We validate the following:

* The token has not expired, and the expiry time is not too far in the future.
* The issuer exists in our system.
* We retrieve the issuers public key and verify the signature.
