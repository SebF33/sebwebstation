#!/usr/bin/env sh

# abort on errors
# set -e

# build
npm run build

# commit
git checkout -b gh-pages
git add -A
git commit -m 'deploy'

# subtree push
git subtree push --prefix dist origin gh-pages

# return to master branch
git checkout master