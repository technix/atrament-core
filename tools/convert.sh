#!/bin/bash
INPUT=$1
OUTPUT_TMP="$1.tmp.json"
OUTPUT="$1.json"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# convert .ink to .json
$DIR/inklecate/inklecate.exe -o $OUTPUT_TMP $INPUT
# remove BOM
tail --bytes=+4 $OUTPUT_TMP > $OUTPUT
rm -f $OUTPUT_TMP