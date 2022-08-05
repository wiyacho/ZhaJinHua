#!/bin/sh
# for hotfix
# $1 jarPath $2 cdnPath $3 buildPath $4 destPath

# source ~/.bash_profile
java -jar $1 "extractDiff" $2 $3 $4
