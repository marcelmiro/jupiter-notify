# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.1.1](https://github.com/marcelmiro/jupiter-notify/compare/v3.1.0...v3.1.1) (2020-09-17)


### Bug Fixes

* **users:** fix error on inserting user to database ([82f0413](https://github.com/marcelmiro/jupiter-notify/commit/82f0413bb9cc458411c794731dee49705b82f803))

## [3.1.0](https://github.com/marcelmiro/jupiter-notify/compare/v3.0.2...v3.1.0) (2020-09-16)


### Features

* **api:** download jupiterscripts file from api route ([e454d3c](https://github.com/marcelmiro/jupiter-notify/commit/e454d3c596faa474fd450aaa7dbc1d1746a37d14))


### Bug Fixes

* **discord:** fix error as access token cant be deleted before software instances (foreign key) ([5d45636](https://github.com/marcelmiro/jupiter-notify/commit/5d4563618ec97d3f0c8ec67c1e089ca1b9204443))

### [3.0.2](https://github.com/marcelmiro/jupiter-notify/compare/v3.0.1...v3.0.2) (2020-09-15)


### Bug Fixes

* **login:** give feedback when trying to login with a Discord account that has no email bound to it ([b10e942](https://github.com/marcelmiro/jupiter-notify/commit/b10e942204b3a617b3b3bead5c82230ab727960b))

### [3.0.1](https://github.com/marcelmiro/jupiter-notify/compare/v3.0.0...v3.0.1) (2020-09-15)

## 3.0.0 (2020-09-11)


### ⚠ BREAKING CHANGES

* New MAJOR update that includes a new API system, implementation of ES5 transpiling using Babel and many more features, fixes and optimisations.


### Features

* **api:** implement api system for user authorization
* **semver:** automatic project versioning and changelog updater
* **logger:** new logging functions (e.g. warn and fatal)
* **role:** convert roles in admin panel to dynamic
* **stripe:** check renewal users still have subscription
* **discord:** store list of Discord servers instead of only 1
* **login:** redirect to a path or url after successful login
* **router:** add /terms route


### Bug Fixes

* **controller:** fix user id parameter in transfer-membership route
* **security:** add content security policy to fix helmet package error
* **socket:** allow non-alphanumeric role name in add-member socket
* **socket:** deny input less than 1 in create-release socket
