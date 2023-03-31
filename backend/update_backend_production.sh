#!/bin/bash

#variables in env file
if [ -f ".env.production" ]; then
    export $(grep -v '^#' .env.production | xargs)
fi

if ! [ "${SPACE_DAYS_REGISTRY}" ]; then
    echo "SPACE_DAYS_REGISTRY is not set!"
    exit 1
fi


if ! [ "${SPACE_DAYS_BACKEND_CONTAINER_ID}" ]; then
    echo "SPACE_DAYS_BACKEND_CONTAINER_ID is not set!"
    exit 1
fi

if ! [ "${ENDPOINT}" ]; then
    echo "ENDPOINT is not set!"
    exit 1
fi

if ! [ "${DB}" ]; then
    echo "DB is not set!"
    exit 1
fi

if ! [ "${SERVICE_ACCOUNT_ID}" ]; then
    echo "SERVICE_ACCOUNT_ID is not set!"
    exit 1
fi

SPACE_DAYS_REGISTRY=$(echo $SPACE_DAYS_REGISTRY | tr -d '\r')
SPACE_DAYS_BACKEND_CONTAINER_ID=$(echo $SPACE_DAYS_BACKEND_CONTAINER_ID | tr -d '\r')
ENDPOINT=$(echo $ENDPOINT | tr -d '\r')
DB=$(echo $DB | tr -d '\r')
SERVICE_ACCOUNT_ID=$(echo $SERVICE_ACCOUNT_ID | tr -d '\r')

new_image_name=$SPACE_DAYS_REGISTRY/space-days-backend:production;
echo $new_image_name;
docker build -t $new_image_name . ;
docker push $new_image_name;

yc sls container revisions deploy \
    --container-id ${SPACE_DAYS_BACKEND_CONTAINER_ID} \
    --memory 512M \
    --cores 1 \
    --execution-timeout 10s \
    --concurrency 8 \
    --min-instances 1 \
    --environment ENDPOINT=${ENDPOINT},DB=${DB},SA_KEY_FILE=${YDB_SERVICE_ACCOUNT_KEY_FILE_CREDENTIALS} \
    --service-account-id ${SERVICE_ACCOUNT_ID} \
    --image "$new_image_name";
