#!/bin/sh

# Input manual to execute
# fetch --no-verify-hostname --no-verify-peer https://github.com/PieterScheffers/node-freebsd-admin/blob/master/src/freebsd_install.sh
# cd /usr/ports/ftp/wget && make install distclean && cd - && wget --no-check-certificate https://github.com/PieterScheffers/node-freebsd-admin/blob/master/src/freebsd_install.sh && chmod +x freebsd_install.sh && sh ./freebsd_install.sh
# TODO: replace link with github link

### To execute:
### chmod +x firstInstall.sh

# Install ports collection
portsnap fetch extract

# Install portmaster
cd /usr/ports/ports-mgmt/portmaster/
make config-recursive
make install distclean
cd -

# Install iojs
portmaster www/iojs

# Create dir for install script
mkdir freebsd_admin
cd freebsd_admin

# Install dependencies
npm install shelljs

# Get install script (js)
#wget --no-check-certificate https://github.com/PieterScheffers/node-freebsd-admin/blob/master/src/freebsd-admin.js # TODO replace with npm install
fetch --no-verify-hostname --no-verify-peer https://github.com/PieterScheffers/node-freebsd-admin/blob/master/src/freebsd-admin.js

# Execute admin script
node freebsd_admin.js
