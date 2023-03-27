#!/bin/bash

#variables in env file
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

if ! [ "${SPACE_DAYS_APP_BUCKET}" ]; then
    echo "SPACE_DAYS_APP_BUCKET is not set!"
    exit 1
fi

cd ./build
s3cmd sync . s3://${SPACE_DAYS_APP_BUCKET}
cd ..
