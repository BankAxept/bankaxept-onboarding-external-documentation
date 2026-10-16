# Dictionary

This dictionary includes internal, external and technical terms used in the BankAxept ecosystem.
This is intended to be a general lightweight reference to reduce confusion and improve communication.

| Term                                                    | Explanation                                                                                                                                                         |
|---------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <span id="acquiring-agreement">Acquiring agreement</span> | Agreement letting a customer receive BankAxept payments into a settlement account. Only needed once per settlement account. Stø AS can enter into it on behalf of supported banks. |
| <span id="api">API</span>                               | Application Programming Interface                                                                                                                                   |
| <span id="bank-identifier">Bank identifier</span>       | Identifying number for a bank. A bank can have several bank identifiers, but 2 banks can never share the same number.                                               |
| <span id="bax-number">Bax number</span>                 | A six or seven digit number which is a unique merchant identifier used in the BankAxept ecosystem. Similar to merchant id for Visa and Mastercard.                  |
| <span id="baxbis">Baxbis</span>                         | The system operated by Nets which issues Bax numbers and maintains the network necessary for payment terminals to work                                              |
| <span id="brreg">BRREG</span>                           | Brønnøysundregistrene, the national register of Norwegian businesses: [brreg.no](https://www.brreg.no/)                                                             |
| <span id="jwt">JWT</span>                               | JSON Web Token                                                                                                                                                      |
| <span id="kar">KAR</span>                               | Konto- og adresseringsregister (Account and Addressing Register). Used to verify that a settlement account belongs to the customer.                                  |
| <span id="mcc">MCC</span>                               | The Merchant Category Code (MCC) is a four-digit number assigned to describe a Merchant’s primary business based on annual sales volume measured in local currency. |
| <span id="nets">Nets</span>                             | Operator of Baxbis. Orders this API does not support go through Nets Ordrekontor.                                                                                   |
| <span id="order">Order</span>                           | A request to register a merchant agreement through this API, identified by an `orderId`. See [Possible Order Statuses](index.md#possible-order-statuses).           |
| <span id="psp">PSP</span>                               | Payment Service Provider                                                                                                                                            |
| <span id="psp-id">PSP ID</span>                         | Identifies the PSP an order is registered under (`pspId`). Required for reseller clients, derived from the client for PSP clients.                                  |
| <span id="reseller">Reseller</span>                     | A company selling BankAxept agreements through a PSP. Orders either directly as a reseller client using a PSP ID, or via a PSP on its behalf. Must be registered with BankAxept first. |
| <span id="settlement-account">Settlement account</span> | The customer's bank account that BankAxept payments are settled to. Must be owned by the customer, see [KAR](#kar).                                                 |
| <span id="signee">Signee</span>                         | A person signing an order on behalf of the customer. See [Signees](test_data.md#signees).                                                                           |
| <span id="webhook">Webhook</span>                       | An HTTP `POST` we send to your `webhookUrl` when an order changes status. See [Webhooks](webhooks.md).                                                              |
