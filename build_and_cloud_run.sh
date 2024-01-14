#!/bin/bash

args=("$@") 
ELEMENTS=${#args[@]}

if [ $# -lt 2 ];
then
	echo Found only $# args.
	
	echo image name: 
	read img_nm

	echo image version:
	read img_vrs
else
	echo Found $# args.
	
    img_nm=$1
	img_vrs=$2
fi

echo Building - ${img_nm}
docker build --no-cache -t ${img_nm}:${img_vrs} .

for (( i=1;i<$ELEMENTS;i++)); do
	if [ $# -gt 2 ];
	then
		img_vrs=${args[${i}]}
	fi
	echo Tagging - ${img_nm}:${img_vrs}
	
	docker tag ${img_nm}:${img_vrs} us-central1-docker.pkg.dev/buzzer-app-377518/rjp-cr/${img_nm}:${img_vrs} && \
	docker push us-central1-docker.pkg.dev/buzzer-app-377518/rjp-cr/${img_nm}:${img_vrs}
	
done

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
	--platform=managed && \
gcloud run services update-traffic buzzer-app \
	--to-latest \
	--platform=managed \
	--region=us-central1