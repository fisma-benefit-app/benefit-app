#!/bin/bash

set -e

NOW=$(date +'%Y%m%d-%H%M%S')
SHORT_SHA=$(git rev-parse --short HEAD)
BRANCH=$(git rev-parse --abbrev-ref HEAD | sed -re 's/[^a-z0-9-]/-/g' | cut -c1-30 | sed -re 's/-+/-/g' | sed -re 's/-$//')

# The image tag will be in the format:
#  - GitHub PR:             pr-123.YYYMMDD-HHMMSS.SHA0123.ci
#  - GitHub merge to main:  BRANCH.YYYMMDD-HHMMSS.SHA0123.ci
#  - Local main:            BRANCH.YYYMMDD-HHMMSS.SHA0123.local
#  - Local branch:          BRANCH.YYYMMDD-HHMMSS.SHA0123.local

if [[ "$GITHUB_REF" == refs/pull* ]]; then
  IMAGE_TAG_PREFIX=pr-$(echo "$GITHUB_REF" | cut -d'/' -f3)
else
  IMAGE_TAG_PREFIX=$BRANCH
fi

if [[ "$CI" == true ]]; then
  IMAGE_TAG_SUFFIX=ci
else
  IMAGE_TAG_SUFFIX=local
fi

IMAGE_TAG="${IMAGE_TAG_PREFIX}.${NOW}.${SHORT_SHA}.${IMAGE_TAG_SUFFIX}"

echo "$IMAGE_TAG"