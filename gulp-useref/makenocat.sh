#!/bin/bash

npm install
npm install gulp-useref@3.0.4 -D
rm -rf dist && gulp
