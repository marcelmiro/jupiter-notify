# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
