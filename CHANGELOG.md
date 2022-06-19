## [1.1.1](https://github.com/sergiogc9/fox-awesome-cli/compare/v1.1.0...v1.1.1) (2022-06-18)

### Bug Fixes

- Use semantic-release ([a64b1ab](https://github.com/sergiogc9/fox-awesome-cli/commit/a64b1ab5898fa12ce31899e80ea18236a85540c4))

## [1.1.1-beta.1](https://github.com/sergiogc9/fox-awesome-cli/compare/v1.1.0...v1.1.1-beta.1) (2022-06-18)

### Bug Fixes

- Use semantic-release ([a64b1ab](https://github.com/sergiogc9/fox-awesome-cli/commit/a64b1ab5898fa12ce31899e80ea18236a85540c4))

## [v1.1.0] - May, 2021

#### Added

- Added `push` shorthand command for git push.
- Added from argument to branch-sync command.
- Added `is-branch-synced`command.

#### Fixed

- Fix warning in newer git version when syncing a branch.
- Fixed git, yarn and npm commands returning a 0 exit code even the command failed.

## [v1.0.1] - March, 2021

#### Added

- Git default branches customization. Now you can use your custom branches instead of master or develop.
- Bitbucket and Azure created pull requests removes source branch when merged.
- Added option to select wanted reviewers when creating a bitbucket pull request.

#### Changed

- Removed `fc` command alias to avoid collision issues with lc linux command.

#### Fixed

- Fixed small bugs.

## [v1.0.0] - March, 2021

First final version after tests have been done.
