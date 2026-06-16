#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
bash "$DIR/coreelec.sh" update
exit
