# fox-awesome-cli

![](https://badgen.net/npm/v/fox-awesome-cli?icon=npm&label)
![](https://github.com/sergiogc9/fox-awesome-cli/workflows/Github%20Pipeline/badge.svg?branch=master)

An awesome cli tool for git, node, npm, yarn, bash and more.

- [fox-awesome-cli](#fox-awesome-cli)
  - [About the cli](#about-the-cli)
  - [Installation](#installation)
  - [Usage](#usage)
  - [General commands](#general-commands)
    - [`help`](#help)
    - [`info`](#info)
    - [`config`](#config)
  - [Git commands](#git-commands)
    - [`branch-create`](#branch-create)
    - [`branch-sync`](#branch-sync)
    - [`pr`](#pr)
    - [`push`](#push)
  - [NodeJS commands](#nodejs-commands)
    - [`pkg-manager`](#pkg-manager)
    - [`pkg-version`](#pkg-version)
    - [`pkg-publish`](#pkg-publish)
  - [Contribute](#contribute)

## About the cli

I created this cli tool to make my life easier when developing. Its goal is to provide helpful commands to be used when developing or in automated processes, e.g. pipelines.

🦊 I named Fox in honor of my westie dog's name, who is also awesome!

## Installation

**Prerequisites**: NodeJS (>=14.x tested only) installed.

You can install it globally:

`yarn global add fox-awesome-cli` or `npm install -g fox-awesome-cli`

Or install locally:

`yarn add fox-awesome-cli` or `npm install fox-awesome-cli`

## Usage

This cli tool can be used with some aliases: `foxcli`, `fox` and `fcli`. You can choose the one you prefer.

The usage is:

`foxcli <command> [options]`

## General commands

These set of commands are focused on providing information or executing some actions which are not related to a specific topic.

### `help`

You can see some information and the available commands using the help option or not using any command:

`foxcli` or `foxcli -h`

ℹ️ By default, all commands have both `-h` and `--help` options available to see their options.

### `info`

Returns some useful information about the system.

Options:

- `--node`: Returns info about the installed node packages.
- `--json`: Returns the data in JSON format to be parsed.

### `config`

Manage, modify and / or remove the data saved used by the cli tool.

All the data saved **IS NOT SENT NOR SHARED** to any server.

With this command you can manage this data with the following actions:

- See all data saved in JSON format.
- Clear all data.
- See path where the data is located.
- Change default branches if not using master or develop.
- Remove personal data saved related to git providers (Github, Azure, Bitbucket, etc.).
- Remove saved data related to a git project or repository.

Use the command without options and all options will be prompted. Use option as shortcuts to options without a prompt.

Options:

- `-a, --all`: See all data saved.
- `-p, --path`: Show the path where data is located.
- `-c, --clear`: Clear all saved data.

Considerations:

- By default, feature branches are created from develop. Hotfix and release branches are created from master.
- If description is provided, it is appended at the end of the branch name, replacing spaces with underscores.

## Git commands

**Prerequisites**: Git installed.

These commands are focused on making the developer life easier while working with Git.

It works only in a basic **gitflow** workflow with the following branches:

- `master` (configurable)
- `hotfix/XXX` or `hotfix-XXX`
- `release/XXX` or `release-XXX`
- `develop` (configurable)
- `feature/XXX` or `feature-XXX`

ℹ️ You can change default master and develop branches if you use others (e.g. main or devel) using the `config` command (see above).

ℹ️ You can use most of git commands using this cli. All git commands not matching one of the cli custom commands can be executed. E.g.: `foxcli commit` or `foxcli merge master`.

### `branch-create`

Creates a new branch using the last changes in source (or from) branch.

This command performs:

- Asks for branch type, issue id (if not provided) and description to generate a new branch name.
- If not provided, detects the source branch, e.g. for feature it uses develop as source branch.
- Pulls the most recent changes in source branch.
- Creates the new branch.
- If branch type is release, merges content from develop.
- If push parameter is set, pushes the branch to remote.

Options:

- `--from`: Disables auto source branch detection to use instead the provided branch.
- `-p, --push`: Pushes to remote the created branch at the end.

Considerations:

- By default, feature branches are created from develop. Hotfix and release branches are created from master.
- If description is provided, it is appended at the end of the branch name, replacing spaces with underscores.

### `branch-sync`

Synchronizes the current branch with the remote source branch. By default **hotfix** and **release** branches are synchronized with **master** branch and **feature** branches are synchronized with **develop**.

If you are already in a source branch (i.e. master or develop) this command does nothing.

This command performs:

- Pulls the most recent changes from source branch.
- Tries to merge these changes into the current branch. You can force doing a rebase using the `--rebase` parameter.

Options:

- `-f, --from`: Synchronize the current branch from a custom branch.
- `-r, --rebase`: Forces git to use rebase.

### `pr`

Creates a PR for current branch. Target branch is set automatically following the gitflow branches, if `--target` option is not set.

This command works with **Github**, **Azure DevOps** and **Bitbucket** repositories.

This command needs a token or app password in order to call the necessary API. Follow the instructions when prompted.

ℹ️ All personal data is saved only locally, i.e. it is not sent nor shared. See config command for further info.

This command performs:

- Asks for pull request data as title, description, etc...
- Pushes current branch to remote.
- Checks for saved authentication data or ask for it.
- Creates the pull request through an API call.
- IF success, the pull request page is opened in a browser.

Options:

- `--target`: Use a custom branch as target branch for the pull request.
- `--draft`: Create the pull request as draft. This option is not available in some providers.

### `push`

This command is basically a shorthand for `git pull` with some improvements.

This command performs:

- Tries to execute the `git pull` command with the passed arguments as it is done using git directly.
- If an error occurs and is one of the controlled errors, it tries to solve it.

Controlled errors implemented:

- If the current branch has not been pushed to remote yet, the cli pushes it to origin automatically.

## NodeJS commands

These commands are helper commands to add non-existing commands or improve existing ones available in `npm` and / or `yarn`. Most of them are focused to be used in automated pipelines.

ℹ️ You can use this cli to execute npm and / or yarn commands. If using a non cli custom command or git commands, the cli identifies if using npm or yarn in the project, and runs the passed command to it. E.g.: `foxcli publish` or `foxcli install`.

ℹ️ Scripts defined in _package.json_ can also be executed using the cli: `foxcli watch` or `foxcli build`.

### `pkg-manager`

Checks the node package manager used in the current directory (and in its parents). Only works with `npm` and `yarn`.

Possible return values: `yarn`, `npm` or `unknown`

### `pkg-version`

Returns the current node package version.

### `pkg-publish`

Publishes the package in current project **only if current version is not already published** in the registry.

Options:

- `-u, --update`: Updates the package version before publishing. See help the options available.
- `-p, --push`: Pushes the changes to remote. It should be done if an update is done to keep consistency.

## Contribute

As said above, this cli has been developed by myself and focused on my workflow, hence it probably does not match the needs of everyone.

If you like it, you can add issues or create pull requests to add new behaviors or features!

Steps for running locally:

- Clone the repo.
- Install dependencies: `yarn install`
- Build while watching for changes: `yarn watch`
- Locally link the cli binaries: `yarn link`

Then you can test it: `yarn foxcli` or `yarn foxcli info`


1111

2222
