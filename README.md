# fox-awesome-cli

![](https://badgen.net/npm/v/fox-awesome-cli?icon=npm&label)
![](https://github.com/sergiogc9/fox-awesome-cli/workflows/Github%20Pipeline/badge.svg?branch=main)

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
    - [`is-branch-synced`](#is-branch-synced)
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

**Prerequisites**: NodeJS (>=16.x tested only) installed.

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
- Change default branches if not using main or develop.
- Change default used Git workflow (continuous deployment or git-flow). See more info in Git section below.
- Remove personal data saved related to git providers (Github, Azure, Bitbucket, etc.).
- Remove saved data related to a git project or repository.

Use the command without options and all options will be prompted. Use option as shortcuts to options without a prompt.

Options:

- `-a, --all`: See all data saved.
- `-p, --path`: Show the path where data is located.
- `-c, --clear`: Clear all saved data.

## Git commands

**Prerequisites**: Git installed.

These commands are focused on making the developer life easier while working with Git.

It works with two Git workflows:

- **Continuous deployment** (default): Only use a _main_ branch. All commands will use as a source branch the branch configured as _main_.
- **Git-flow**: Use both _main_ and _develop_ branches. All branches except _fix_ and _release_ will use as source branch the branch configured as _develop_.

ℹ️ You can change default main and develop branches if you use others (e.g. master or devel) using the `config` command (see above).

ℹ️ You can use most of git commands using this cli. All git commands not matching one of the cli custom commands can be executed. E.g.: `foxcli commit` or `foxcli merge main`.

### `branch-create`

Creates a new branch using the last changes in source (or from) branch.

This command performs:

- Asks for branch type, issue id and description to generate a new branch name.
- If not provided, detects the source branch, e.g. if using git-flow then for feature branches it uses develop as source branch.
- Pulls the most recent changes in source branch.
- Creates the new branch.
- If branch type is release using git-flow, merges content from develop.
- If push parameter is set, pushes the branch to remote.

The output format of branches are:

- If issue id is provided: `feature-ISSUE-100-this_is_a_nice_description`.
- If issue id is not provided: `feature-this_is_a_nice_description`.
- If branch type is `none`: `ISSUE-100-this_is_a_nice_description`.
- If branch type is `none` and issue id is not provided: `this_is_a_nice_description`.

Options:

- `--from`: Disables auto source branch detection to use instead the provided branch.
- `-p, --push`: Pushes to remote the created branch at the end.

Considerations:

- By default, if using git-flow workflow, fix and release branches are created from main and others are created from develop.
- If description is provided, it is appended at the end of the branch name, replacing spaces with underscores.

### `branch-sync`

Synchronizes the current branch with the remote source branch.

By default, if using continuous deployment workflow, all branches are synchronized with **main**. Otherwise, if using git-flow, **hotfix** and **release** branches are synchronized with **main** branch and **feature** branches are synchronized with **develop**.

If you are already in a source branch (i.e. main or develop) this command does nothing.

This command performs:

- Pulls the most recent changes from source branch.
- Tries to merge these changes into the current branch. You can force doing a rebase using the `--rebase` parameter.

Options:

- `-f, --from`: Synchronize the current branch from a custom branch.
- `-r, --rebase`: Forces git to use rebase.

### `is-branch-synced`

Check if current branch is synced with the remote source branch (i.e. the current branch has the newest changes from remote source branch).

This command is useful to prevent creating a new pull request or pushing new changes without if current branch is not synchronized. For example, it can be used in the `pre-push` git hook.

If you are already in a source branch (i.e. main or develop) this command does nothing.

This command only checks the sync status with the remote current branch. If you have changes locally not pushed to remote it won't work as expected, but main source branches (i.e. main, develop) should not be committed locally.

This command performs:

- Fetches the most recent changes from source branch.
- Checks if common base commit between current branch and remote source branch last commit equals to last remote source branch last commit.

Options:

- `-f, --from`: Check sync status with a remote custom branch. Use branch without `origin/` prefix.

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
