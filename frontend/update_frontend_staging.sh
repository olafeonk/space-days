#!/bin/bash

#variables in env file
if [ -f ".env.staging" ]; then
    export $(grep -v '^#' .env.staging | xargs)
fi

if ! [ "${SPACE_DAYS_APP_BUCKET}" ]; then
    echo "SPACE_DAYS_APP_BUCKET is not set!"
    exit 1
fi

cd ./build
s3cmd sync . s3://${SPACE_DAYS_APP_BUCKET}
s3cmd --recursive modify --acl-public --add-header='content-type':'text/javascript' --exclude '' --include '.js' s3://${SPACE_DAYS_APP_BUCKET}
s3cmd --recursive modify --acl-public --add-header='content-type':'text/css' --exclude '' --include '.css' s3://${SPACE_DAYS_APP_BUCKET}
cd ..
