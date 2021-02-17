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
  - [Git commands](#git-commands)
    - [`branch-sync`](#branch-sync)
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

This cli tool can be used with some aliases: `foxcli`, `fox`, `fcli` and `fc`. You can choose the one you prefer.

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

## Git commands

**Prerequisites**: Git installed.

These commands are focused on making the developer life easier while working with Git.

It works only in a basic **gitflow** workflow with the following branches:

- `master`
- `hotfix/XXX` or `hotfix-XXX`
- `release/XXX` or `release-XXX`
- `develop`
- `feature/XXX` or `feature-XXX`

\* In the future this will be configurable.

ℹ️ You can use most of git commands using this cli. All git commands not matching one of the cli custom commands can be executed. E.g.: `foxcli commit` or `foxcli merge master`.

### `branch-sync`

Synchronizes the current branch with the remote source branch. By default **hotfix** and **release** branches are synchronized with **master** branch and **feature** branches are synchronized with **develop**.

If you are already in a source branch (i.e. master or develop) this command does nothing.

Basically this command performs:

- Pulls the most recent changes from source branch.
- Tries to merge these changes into the current branch. You can force doing a rebase using the `--rebase` parameter.

Options:

- `-r, --rebase`: Forces git to use rebase.

## NodeJS commands

These commands are helper commands to add non-existing commands or improve existing ones available in `npm` and / or `yarn`. Most of them are focused to be used in automated pipelines.

ℹ️ You can use this cli to execute npm and / or yarn commands. If using a non cli custom command or git commands, the cli identifies if using npm or yarn in the project, and runs the passed command to it. E.g.: `foxcli publish` or `foxcli install`.

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
