#!/bin/bash

git checkout -D pre-gh-pages
git checkout -D gh-pages

git checkout -b pre-gh-pages
echo "!pub/bundle*" >> .gitignore
echo "!pub/*.woff" >> .gitignore
echo "!pub/*.eot" >> .gitignore
echo "!pub/*.ttf" >> .gitignore

git add pub .gitignore
git commit -m "[pre-deploy] adds compiled assets to subtree."

# split and deploy
git subtree split --prefix pub -b gh-pages
git push -f origin gh-pages:gh-pages

git checkout master
git branch -D pre-gh-pages
git branch -D gh-pages
# git branch -D gh-pages
