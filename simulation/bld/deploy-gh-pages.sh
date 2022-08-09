#!/bin/bash
cd ..

git branch -D pre-gh-pages
git branch -D gh-pages

git checkout -b pre-gh-pages
echo "!simulation/pub/bundle*" >> .gitignore
echo "!simulation/pub/*.woff" >> .gitignore
echo "!simulation/pub/*.eot" >> .gitignore
echo "!simulation/pub/*.ttf" >> .gitignore

git add simulation/pub .gitignore
git commit -m "[pre-deploy] adds compiled assets to subtree."

# split and deploy
git subtree split --prefix simulation/pub -b gh-pages
git push -f origin gh-pages:gh-pages

git checkout main
git branch -D pre-gh-pages
git branch -D gh-pages
# git branch -D gh-pages
