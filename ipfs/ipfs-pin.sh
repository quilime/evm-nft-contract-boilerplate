#!/bin/sh
ID=$1
curl -X POST -u "${INFURA_IPFS_PROJECT_ID}:${INFURA_IPFS_PROJECT_SECRET}" \
"https://ipfs.infura.io:5001/api/v0/pin/add?arg=${ID}"

