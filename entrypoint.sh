#!/bin/sh

if [ -n "$VAULT_GITHUB_TOKEN" ]; then
  mkdir -p ssl
  vault auth -method=github token=$VAULT_GITHUB_TOKEN
  vault read -field=value $VAULT_APPLICATION_PATH/sslkey > ./ssl/server.key
  vault read -field=value $VAULT_APPLICATION_PATH/sslcert > ./ssl/server.crt
fi

export NODE_PATH=$PWD
node server.js
