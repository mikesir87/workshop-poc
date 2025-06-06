#!/bin/bash

git config --global user.email "demo@example.com"
git config --global user.name "Docker demo"
git config --global --add safe.directory /project

cd /project

# Remove everything including hidden files (like the .git directory)
ls -A1 | xargs rm -rf

git clone https://github.com/dockersamples/catalog-service-node .
git switch workshop-poc
git apply --whitespace=fix ./demo/workshop-poc/demo.patch
git commit -am "Demo prep"

npm install

chown 1000:1000 -R /project