#!/bin/bash

args=("$@") 
ELEMENTS=${#args[@]}

if [ $# -lt 2 ];
then
	echo Found only $# args.
	img_nm='buzzer'
	img_vrs='latest'
	echo "Using defaults: ${img_nm}:${img_vrs}"
else
	echo Found $# args.
    img_nm=$1
	img_vrs=$2
fi

## echo GCP Cloud Building - us-central1-docker.pkg.dev/buzzer-app-377518/rjp-cr/${img_nm}:${img_vrs}
## gcloud builds submit --tag us-central1-docker.pkg.dev/buzzer-app-377518/rjp-cr/${img_nm}:${img_vrs}
#####################################################
echo Building - ${img_nm}
docker build --platform=linux/amd64 --no-cache -t ${img_nm}:${img_vrs} .

echo "Tagging & Pushing - ${img_nm}:${img_vrs}"
docker tag ${img_nm}:${img_vrs} us-central1-docker.pkg.dev/buzzer-app-377518/rjp-cr/${img_nm}:${img_vrs} && \
docker push us-central1-docker.pkg.dev/buzzer-app-377518/rjp-cr/${img_nm}:${img_vrs}

echo Deploying - ${img_nm}:${img_vrs}
gcloud run deploy buzzer-app \
	--image=us-central1-docker.pkg.dev/buzzer-app-377518/rjp-cr/${img_nm}:${img_vrs} \
	--allow-unauthenticated \
	--region=us-central1 \
	--project=buzzer-app-377518 \
	--port=8090 \
	--cpu=1 \
	--min-instances=0 \
	--max-instances=2 \
	--concurrency=25 \
	--platform=managed \
	--timeout=300 && \
gcloud run services update-traffic buzzer-app \
	--to-latest \
	--platform=managed \
	--region=us-central1