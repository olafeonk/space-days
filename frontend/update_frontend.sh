#!/bin/bash

#variables in env file
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

if ! [ "${SPACE_DAYS_APP_BUCKET}" ]; then
    echo "SPACE_DAYS_APP_BUCKET is not set!"
    exit 1
fi

s3cmd sync ./ --exclude '.env' s3://${SPACE_DAYS_APP_BUCKET}
s3cmd --recursive modify --add-header=content-type:application/javascript  s3://${SPACE_DAYS_APP_BUCKET}/js/
s3cmd --recursive modify --add-header=content-type:text/css  s3://${SPACE_DAYS_APP_BUCKET}/css/
