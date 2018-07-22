#!/usr/bin/env bash
npm run clean
npm run build:dist
ssh -i "~/myKeyPair2.pem" ubuntu@ec2-18-219-235-24.us-east-2.compute.amazonaws.com  'sudo rm -r ~/app/dist | exit'
scp -i "~/myKeyPair2.pem" -r dist  ubuntu@ec2-18-219-235-24.us-east-2.compute.amazonaws.com:~/app
ssh -i "~/myKeyPair2.pem" ubuntu@ec2-18-219-235-24.us-east-2.compute.amazonaws.com 'bash -s' < ./run.sh