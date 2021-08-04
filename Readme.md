### How to configure .env file (Not include in project)

```
WS_PORT=8080

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