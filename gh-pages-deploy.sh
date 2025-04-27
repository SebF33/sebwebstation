#!/usr/bin/env sh

# abort on errors
# set -e

# build
npm run build

# commit
git add -f dist
git commit -m 'deploy'

# subtree push
git subtree push --prefix dist origin gh-pages

# return to master branch
git checkout master