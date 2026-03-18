#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "usage: $0 <deb-version> <output-deb-path>" >&2
  exit 1
fi

DEB_VERSION="$1"
OUTPUT_DEB="$2"
PACKAGE_NAME="velo"
ARCH="amd64"
INSTALL_ROOT="/opt/${PACKAGE_NAME}"

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "${WORK_DIR}"' EXIT

PACKAGE_ROOT="${WORK_DIR}/${PACKAGE_NAME}_${DEB_VERSION}_${ARCH}"
mkdir -p "${PACKAGE_ROOT}/DEBIAN"
mkdir -p "${PACKAGE_ROOT}${INSTALL_ROOT}"
mkdir -p "${PACKAGE_ROOT}/usr/bin"

cat > "${PACKAGE_ROOT}/DEBIAN/control" <<EOF
Package: ${PACKAGE_NAME}
Version: ${DEB_VERSION}
Section: utils
Priority: optional
Architecture: ${ARCH}
Maintainer: alaric <alaric851@gmail.com>
Depends: nodejs
Description: Config-driven scaffold CLI for project bootstrapping
EOF

cat > "${PACKAGE_ROOT}/usr/bin/velo" <<EOF
#!/bin/sh
exec node ${INSTALL_ROOT}/dist/index.js "\$@"
EOF
chmod 0755 "${PACKAGE_ROOT}/usr/bin/velo"

cp -a dist "${PACKAGE_ROOT}${INSTALL_ROOT}/"
cp -a node_modules "${PACKAGE_ROOT}${INSTALL_ROOT}/"
cp package.json README.md "${PACKAGE_ROOT}${INSTALL_ROOT}/"

mkdir -p "$(dirname "${OUTPUT_DEB}")"
dpkg-deb --build --root-owner-group "${PACKAGE_ROOT}" "${OUTPUT_DEB}"
