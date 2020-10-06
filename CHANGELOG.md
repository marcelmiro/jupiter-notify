# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.3.0](https://github.com/marcelmiro/jupiter-notify/compare/v4.2.1...v4.3.0) (2020-10-06)


### Features

* **discord:** add setting to check if user should be kicked from server on subscription cancel ([3e25b3d](https://github.com/marcelmiro/jupiter-notify/commit/3e25b3d7e01f8161a0e392241deb7a82320e4e73))

### [4.2.1](https://github.com/marcelmiro/jupiter-notify/compare/v4.2.0...v4.2.1) (2020-10-05)

## [4.2.0](https://github.com/marcelmiro/jupiter-notify/compare/v4.1.2...v4.2.0) (2020-10-05)


### Features

* **logger:** change logger location from file to database ([c51b3f8](https://github.com/marcelmiro/jupiter-notify/commit/c51b3f8e76aa8c9d29da1b05fec13a06a098a696))

### [4.1.2](https://github.com/marcelmiro/jupiter-notify/compare/v4.1.1...v4.1.2) (2020-09-30)


### Bug Fixes

* **login:** add fallback on passport deserialization error ([d49a2cb](https://github.com/marcelmiro/jupiter-notify/commit/d49a2cb2250694fcbded957cc239151fb71140e7))

### [4.1.1](https://github.com/marcelmiro/jupiter-notify/compare/v4.1.0...v4.1.1) (2020-09-30)


### Bug Fixes

* **database:** remove require from cookieId in users schema model ([b4d34bb](https://github.com/marcelmiro/jupiter-notify/commit/b4d34bba6dc1a6441808206f50ce1a0241185aa7))

## [4.1.0](https://github.com/marcelmiro/jupiter-notify/compare/v4.0.0...v4.1.0) (2020-09-29)


### Features

* **discord:** add setting to allow anyone join Discord server from /join route ([a878ab2](https://github.com/marcelmiro/jupiter-notify/commit/a878ab280c329ccc2579330e5f65c769410dce67))

## [4.0.0](https://github.com/marcelmiro/jupiter-notify/compare/v3.1.4...v4.0.0) (2020-09-29)


### ⚠ BREAKING CHANGES

* Dynamic subscriptions and dynamic dashboard images.


### Features

* **login:** add full url login redirects
* add feedback responses to transfer membership controller
* add update payment popup when subscription has no payment method


### Bug Fixes
* **database:** remove one_time_use column from software_ids table
* **admin:** make role dropdown always hide when clicking a role
* **admin:** fix roles in role dropdown show correctly when containing spaces

### [3.1.4](https://github.com/marcelmiro/jupiter-notify/compare/v3.1.3...v3.1.4) (2020-09-22)


### Bug Fixes

* **stripe:** fix update payment route ([77ff751](https://github.com/marcelmiro/jupiter-notify/commit/77ff7517e19cb08db72bf3e89a590a9078f6cf81))

### [3.1.3](https://github.com/marcelmiro/jupiter-notify/compare/v3.1.2...v3.1.3) (2020-09-20)


### Bug Fixes

* **discord:** add discord role on transfer membership ([cadfab4](https://github.com/marcelmiro/jupiter-notify/commit/cadfab41156918012f1f470c412ba717cc81c12d))

### [3.1.2](https://github.com/marcelmiro/jupiter-notify/compare/v3.1.1...v3.1.2) (2020-09-20)


### Bug Fixes

* **stripe:** fix joi validation in transfer membership route ([c0d2765](https://github.com/marcelmiro/jupiter-notify/commit/c0d2765b39c63e27d9866a4846c0992093fff8e9))

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
