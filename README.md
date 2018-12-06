# graphql

API application created with Addison **api** application template.

For more information:
* [Addison Command Line Interface](https://github.hpe.com/global-it-addison/addison-cli)
* [Addison application templates](https://github.hpe.com/global-it-addison/generator-addison)

## Running locally

To develop this project locally, add a `.env` file to the root of your project with the following content:

```
ADDISON_HOST=0.0.0.0
ADDISON_PORT=8443
NODE_PATH=.
```

You'll also want to create an `ssl` folder in the application root that contains localhost `server.crt` and `server.key` files. Run the following commands from your application root folder to do this (use [Git Bash](https://git-scm.com/download/win) or [Cygwin](https://cygwin.com/install.html) in Windows):

```sh
mkdir ssl && cd ssl
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -subj "//C=US\ST=California\L=Palo Alto\O=Hewlett Packard Enterprise Company\OU=Servers\CN=localhost"
openssl x509 -req -days 1024 -in server.csr -signkey server.key -out server.crt
rm server.csr
```

Use the following for non-Windows systems: `"/C=US/ST=California/L=Palo Alto/O=Hewlett Packard Enterprise Company/OU=Servers/CN=localhost"`
