This module is similar to [win-ca][] but for Mac OS. In fact I have copied most of its documentation and I have tried to maintain api compatibility.

# mac-ca

Get MacOS System Root certificates for [Node.js][].

## Rationale

> Node uses a
> [statically compiled, manually updated, hardcoded list][node.pem]
> of certificate authorities,
> rather than relying on the system's trust store...
> [Read more][node/4175]

This package is intended to fetch Root CAs from MacOS "SystemRootCertificates.keychain" and make them available to [Node.js] application with minimal efforts.

### Advantages

- No internet access is required at all
- MacOS store is updated automatically (in most modern environments)
- Manually installed Root certificates are used
- Enterpise trusted certificates (GPO etc.) are made available too

## Usage

Just say `npm install --save mac-ca` and then call `require('mac-ca')`.

It is safe to use it under other OSes (not MacOS).

## API

After `require('mac-ca')` MacOs' Root CAs are found, deduplicated and installed to `https.globalAgent.options.ca` so they are automatically used for all requests with Node.js' https module.

For use in other places, these certificates are also available via `.all()` method (in [node-forge][]'s format).

```js
let ca = require('mac-ca')
let forge = require('node-forge')

for (let crt of ca.all())
  console.log(forge.pki.certificateToPem(crt))
```
Unfortunately, `node-forge` at the time of writing is unable to
parse non-RSA certificates
(namely, ECC certificates becoming more popular).
If your *Trusted Root Certification Authorities* store
contains modern certificates,
`.all()` method will throw exception.

To fix this, one can pass `format` parameter to `.all` method:
```js
let ca = require('mac-ca')

for (let crt of ca.all(ca.der2.pem))
  console.log(crt)
```
Available values for `format` are:

| Constant | Value | Meaning
|---|---:|---
der2.der | 0 | DER-format (binary, Node's [Buffer][])
|der2.pem | 1 | PEM-format (text, Base64-encoded)
|der2.txt| 2 | PEM-format plus some info as text
|der2.asn1| 3 | ASN.1-parsed certificate
| * | * | Certificate in `node-forge` format (RSA only)

One can enumerate Root CAs himself using `.each()` method:

```js
let ca = require('mac-ca')

ca.each(crt=>
  console.log(forge.pki.certificateToPem(crt)))
```

But this list may contain duplicates.

Asynchronous enumeration is not supported by this module yet.

## Credits

Uses [node-forge][] and is heavily inspired by **Stas Ukolov**'s [win-ca][].

See also [OpenSSL::Win::Root][].

[win-ca]: https://github.com/ukoloff/win-ca
[node-forge]: https://github.com/digitalbazaar/forge
[OpenSSL::Win::Root]: https://github.com/ukoloff/openssl-win-root
[Node.js]: http://nodejs.org/
[Buffer]: https://nodejs.org/api/buffer.html
[node.pem]: https://github.com/nodejs/node/blob/master/src/node_root_certs.h
[node/4175]: https://github.com/nodejs/node/issues/4175
[OpenSSL]: https://www.openssl.org/
