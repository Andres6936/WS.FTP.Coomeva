### How to configure .env file (Not include in project)

```
# Posible values are only Integers
PORT=8080

# Posibles value are <true | false>
DEBUG=true

FTPS_HOST=ftp.example.com
FTPS_PORT=555
FTPS_USER=my_user
FTPS_PASS=my_password
FTPS_DIR=my_directory_ftp
```

### Should I commit my .env file?

No. We strongly recommend against committing your .env file to version control. It should only include
environment-specific values such as database passwords or API keys. Your production database should have a different
password than your development database.

#### Should I have multiple .env files?

No. We strongly recommend against having a "main" .env file and an "environment"
.env file like .env.test. Your config should vary between deploys, and you should not be sharing values between
environments.

### Untrusted Cert

In general, any new web service using SSL/TLS should try to use a certificate issued by an authorized body and not sign
its own certificates. issued by an authorized body and not sign its own certificates, however this is not always the
case, for the service here exposed, the FTPS server uses a certificate issued by an organization that has problems with
the certificates it issued. problems with the certificates it issued in 2018, this by default is not in the list of
authorized bodies. authorized organizations, with this, the service never manages to establish a secure connection and
the server ends up expelling it or ends up expelling it or terminating the connection, the step that was decided to take
was to take that certificate with which the FTPS server was signed. the FTPS server was signed and add it to the list of
authorities, the command has been:

`openssl s_client -connect ftps.coomeva.com.co:990 -starttls ftp`

Once the certificate is obtained it must be added to the list of authorities, to do this you should copy the certificate
and move it to `/usr/local/share/ca-certificates/`, then update the list:

`sudo update-ca-certificates`