#!/bin/bash

git config --global user.email "demo@example.com"
git config --global user.name "Docker demo"
git config --global --add safe.directory /project

cd /project

# Remove everything including hidden files (like the .git directory)
ls -A1 | xargs rm -rf

git clone https://github.com/mikesir87/workshop-poc-content .

chown 1000:1000 -R /project