#!/bin/sh
source .env
DIR=$1
curl -X POST -F file="@${DIR}" \
-H "Content-Type: application/octet-stream" \
-u "${INFURA_IPFS_PROJECT_ID}:${INFURA_IPFS_PROJECT_SECRET}" \
"https://ipfs.infura.io:5001/api/v0/add"
