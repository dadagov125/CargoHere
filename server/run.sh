#!/usr/bin/env bash

#sudo docker stop app_app_1
#sudo docker stop app_mongo_1
#
#sudo docker rm app_app_1
#sudo docker rm app_mongo_1

#sudo docker rmi $(sudo docker images -q)
cd ~/app/dist
sudo docker-compose down
sudo docker rmi dist_app
sudo docker-compose build
sudo docker-compose up -d
