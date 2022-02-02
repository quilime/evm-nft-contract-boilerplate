#!/bin/sh
source .env
FILE=$1
curl -X POST -F file=@${FILE} \
-u "${INFURA_IPFS_PROJECT_ID}:${INFURA_IPFS_PROJECT_SECRET}" \
"https://ipfs.infura.io:5001/api/v0/add"
