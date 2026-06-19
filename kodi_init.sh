#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="${1:-$DIR/coreelec.sh}"
bash "$SCRIPT"
exit
