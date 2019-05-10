#!/bin/sh
echo 'build static resources'
npm run show-build
# kill old container
if docker ps | grep -i taroco-ui
    then
        echo 'kill old container'
        docker kill taroco-ui
fi

# remove old container
if docker ps -a | grep -i taroco-ui
    then
        echo 'rm old container'
        docker rm taroco-ui
fi

# remove old images
if docker images | grep docker_taroco-ui:latest
    then
        echo 'remove old image'
        docker rmi docker_taroco-ui:latest
fi

echo 'build image'
docker build --rm -t docker_taroco-ui:latest .
echo 'run docker container'
docker run -p 80:80 --name taroco-ui -d docker_taroco-ui:latest