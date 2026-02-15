#!/usr/bin/env sh

# abort on errors
# set -e

# build
git checkout master
npm run build

# commit
git add -f dist
git commit -m 'deploy'

# subtree push
git subtree push --prefix dist origin gh-pages

# master branch push
git push