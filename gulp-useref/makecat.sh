#!/bin/bash

npm install
npm install gulp-useref@3.1.0 -D
rm -rf dist && gulp
