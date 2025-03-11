#!/bin/bash

git config --global user.email "demo@example.com"
git config --global user.name "Docker demo"

cd /project

# Remove everything including hidden files (like the .git directory)
ls -A1 | xargs rm -rf

git clone https://github.com/dockersamples/catalog-service-node .
git checkout -b demo
git apply --whitespace=fix ./demo/sdlc-e2e/demo.patch
git commit -am "Demo prep"

npm install
