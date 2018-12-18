# Changelog
All notable changes to this project will be documented in this file.

## [0.0.11] - 2018-08-19
### Added
- optionally flag WORKDIR instructions that do not point to an absolute path ([#47](https://github.com/rcjsuen/dockerfile-utils/issues/47))
  - `ValidationCode.WORKDIR_IS_NOT_ABSOLUTE`
  - `ValidatorSettings.instructionWorkdirRelative`
- add support for SCTP in EXPOSE instruction ([#52](https://github.com/rcjsuen/dockerfile-utils/issues/52))

### Fixed
- fix incorrect validation of ENV and LABEL instructions with many quoted properties on mulitple lines ([#50](https://github.com/rcjsuen/dockerfile-utils/issues/50))

## [0.0.10] - 2018-06-27
### Added
- flag FROM instructions that refer to an invalid image digest in a private registry with a port as an error ([#42](https://github.com/rcjsuen/dockerfile-utils/issues/42))
- flag variables that have an invalid modifier set ([#38](https://github.com/rcjsuen/dockerfile-utils/issues/38))
- warn if ARG instruction does not define a name for the variable ([#45](https://github.com/rcjsuen/dockerfile-utils/issues/45))
- flag incorrectly quoted arguments for ARG, ENV, and LABEL ([#40](https://github.com/rcjsuen/dockerfile-utils/issues/40))

### Changed
- [upgraded the dependency of Mocha](https://github.com/mochajs/mocha/issues/2791) from 3.x to 5.x
  - versions prior to 4.x of Mocha dependended on Growl 1.9.2 which contained a [security vulnerability](https://github.com/tj/node-growl/issues/60)
  - as Mocha is a `devDependencies` module, there is no reason to believe that the `dockerfile-utils` module itself was affected by this vulnerability

### Fixed
- fix incorrect validation warning in ARG, ENV, and LABEL instructions caused by quotes being used in variable replacements ([#36](https://github.com/rcjsuen/dockerfile-utils/issues/36))
- fix incorrect validation of tagged images caused by FROM referencing images in a private registry ([#39](https://github.com/rcjsuen/dockerfile-utils/issues/39))
- allow variables to be used in a FROM's base image argument ([#43](https://github.com/rcjsuen/dockerfile-utils/issues/43))
- handle ARG instructions with escaped newlines that lead to an EOF comment ([#44](https://github.com/rcjsuen/dockerfile-utils/issues/44))

## [0.0.9] - 2018-04-16
### Fixed
- do not flag FROM instructions that use variables with an error ([#35](https://github.com/rcjsuen/dockerfile-utils/issues/35))

## [0.0.8] - 2018-04-08
### Added
- warn if hyphens are being parsed as a unit of time in HEALTHCHECK duration flags ([#24](https://github.com/rcjsuen/dockerfile-utils/issues/24))
- warn if two or more decimals found in a unit of time in HEALTHCHECK duration flags ([#25](https://github.com/rcjsuen/dockerfile-utils/issues/25))
- warn if two hyphens are found in HEALTHCHECK duration flags ([#26](https://github.com/rcjsuen/dockerfile-utils/issues/26))
- warn if instruction is written in JSON form incorrectly with single quotes ([#28](https://github.com/rcjsuen/dockerfile-utils/issues/28))
  - `ValidationCode.JSON_IN_SINGLE_QUOTES`
  - `ValidatorSettings.instructionJSONInSingleQuotes`

### Fixed
- fix incorrect validation error if a COPY uses JSON arguments and its last string argument is correctly defined as a folder ([#29](https://github.com/rcjsuen/dockerfile-utils/issues/29))
- fix incorrect validation error if an ADD uses JSON arguments and its last string argument is correctly defined as a folder ([#30](https://github.com/rcjsuen/dockerfile-utils/issues/30))
- skip validation of content after a JSON's closing bracket ([#33](https://github.com/rcjsuen/dockerfile-utils/issues/33))
- fix validation of number of arguments for ADD and COPY instructions written in JSON ([#34](https://github.com/rcjsuen/dockerfile-utils/issues/34))

## [0.0.7] - 2018-03-01
### Fixed
- use a non-zero range for the diagnostic if FROM's base image's digest is the empty string ([#21](https://github.com/rcjsuen/dockerfile-utils/issues/21))
- ignore multiple CMD, ENTRYPOINT, and HEALTHCHECK instructions in a Dockerfile if there is only ever one in a build stage ([#22](https://github.com/rcjsuen/dockerfile-utils/issues/22))
- handle invalid decimal values without a leading zero for duration flags ([#23](https://github.com/rcjsuen/dockerfile-utils/issues/23))

## [0.0.6] - 2018-02-11
### Added
- create a Docker image for running the CLI ([#10](https://github.com/rcjsuen/dockerfile-utils/issues/10))
- create tags for the Docker image that corresponds to the Git commit's SHA hash ([#16](https://github.com/rcjsuen/dockerfile-utils/issues/16))
- warn if COPY has more than two arguments and its last argument is not a directory ([#14](https://github.com/rcjsuen/dockerfile-utils/issues/14))
  - `ValidationCode.INVALID_DESTINATION`
- warn if ADD has more than two arguments and its last argument is not a directory ([#17](https://github.com/rcjsuen/dockerfile-utils/issues/17))
  - `ValidationCode.INVALID_DESTINATION`
- flag durations that include a hyphen as an error ([#18](https://github.com/rcjsuen/dockerfile-utils/issues/18))
- warn if FROM's base image's digest is invalid ([#15](https://github.com/rcjsuen/dockerfile-utils/issues/15))
  - `ValidationCode.INVALID_REFERENCE_FORMAT`
- warn if FROM's base image's tag is invalid ([#20](https://github.com/rcjsuen/dockerfile-utils/issues/20))
  - `ValidationCode.INVALID_REFERENCE_FORMAT`

### Fixed
- warn if STOPSIGNAL uses invalid variables for its argument ([#11](https://github.com/rcjsuen/dockerfile-utils/issues/11))
- allow decimal values for duration flags ([#19](https://github.com/rcjsuen/dockerfile-utils/issues/19))

## [0.0.5] - 2018-01-18
### Added
- warn if COPY's --from flag is invalid ([#9](https://github.com/rcjsuen/dockerfile-utils/issues/9))
  - `ValidationCode.FLAG_INVALID_FROM_VALUE`

### Fixed
- correct import error in the CLI linter ([#8](https://github.com/rcjsuen/dockerfile-utils/issues/8))

## [0.0.4] - 2018-01-17
### Added
- expose ValidationCode enum as an API that may change ([#7](https://github.com/rcjsuen/dockerfile-utils/issues/7))

## [0.0.3] - 2018-01-17
### Added
- create TypeScript typings ([#5](https://github.com/rcjsuen/dockerfile-utils/issues/5))
- add the main field to package.json ([#6](https://github.com/rcjsuen/dockerfile-utils/issues/6))

## [0.0.2] - 2018-01-17
### Fixed
- include final character of the file when printing errors in the linter ([#4](https://github.com/rcjsuen/dockerfile-utils/issues/4))
- change linter to ignore EXPOSE instructions that use ARG variables without a default value ([#3](https://github.com/rcjsuen/dockerfile-utils/issues/3))

## 0.0.1 - 2017-12-22
### Added
- create formatter for Dockerfiles
- create linter for Dockerfiles

[0.0.11]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.10...v0.0.11
[0.0.10]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.1...v0.0.2
