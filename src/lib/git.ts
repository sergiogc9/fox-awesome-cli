import chalk from 'chalk';
import inquirer from 'inquirer';

import { execSilent, execSilentWithThrow } from 'lib/shell';
import configStore from 'lib/config';
import log from 'lib/log';
import GithubProvider from 'providers/git/github';
import AzureProvider from 'providers/git/azure';
import BitbucketProvider from 'providers/git/bitbucket';

export const MAIN_BRANCH = configStore.get('git.branch.main') || 'main';
export const DEVELOP_BRANCH = configStore.get('git.branch.develop') || 'develop';

export const checkGitInstallation = () => {
	const { code } = execSilent('git --version');
	if (code) throw { code, message: 'Git is not installed' };
};

export const getCurrentBranch = () => execSilentWithThrow('git branch --show-current').stdout.trim();

export const existsLocalBranch = (branch: string) =>
	execSilentWithThrow(`git branch --list ${branch}`).stdout.trim() === branch || getCurrentBranch() === branch;

export const existsRemoteBranch = (branch: string) =>
	execSilentWithThrow(`git ls-remote --heads origin ${branch}`).stdout.trim() !== '';

export const getRepoRemoteUrl = () => {
	const { code, stdout } = execSilent('git config --get remote.origin.url');
	if (code) throw { message: 'You are not in a git project' };
	return stdout;
};

const __detectGitWorkflow = (): GitWorkflow => {
	return configStore.get(`git.workflow.default`) ?? 'only_main';
};

export const getSourceBranchFromBranch = (branch: string) => {
	const gitWorkflow = __detectGitWorkflow();

	if (gitWorkflow === 'only_main') {
		return MAIN_BRANCH;
	}
	if (gitWorkflow === 'main_and_develop') {
		if (branch === DEVELOP_BRANCH || /^(fix|release)(\(|:).*/.test(branch)) return MAIN_BRANCH;
		return DEVELOP_BRANCH;
	}

	throw new Error('Current workflow value is not valid. Please clear config.');
};

const __detectRepoServer = async (repoUrl: string) => {
	let detectedServer: GitServer;
	if (repoUrl.includes('github.com')) detectedServer = 'github';
	if (repoUrl.includes('azure.com')) detectedServer = 'azure';
	if (repoUrl.includes('bitbucket.org')) detectedServer = 'bitbucket';

	if (detectedServer) {
		const answer = await inquirer.prompt<{ isCorrect: boolean }>([
			{
				name: 'isCorrect',
				message: `Looks like this is repository from ${chalk.blueBright(detectedServer)}. Is this correct?`,
				type: 'confirm',
				default: false
			}
		]);
		if (answer.isCorrect) return detectedServer;
	} else log.warn('Not able to detect git server...');

	const answer = await inquirer.prompt<{ server: GitServer }>([
		{
			name: 'server',
			message: 'Which git server uses this repository?',
			type: 'list',
			choices: ['github', 'azure', 'bitbucket']
		}
	]);
	return answer.server;
};

export const getRepoServer = async () => {
	const repoUrl = getRepoRemoteUrl();
	const repoServerConfigKey = `git.repo.${repoUrl.replace(/\.+/g, '\\.')}.server`;
	let repoServer: string = configStore.get(repoServerConfigKey);
	if (!repoServer) {
		repoServer = await __detectRepoServer(repoUrl);
		configStore.set(repoServerConfigKey, repoServer);
	}
	return repoServer as GitServer;
};

const __gitProviders = {
	github: GithubProvider,
	azure: AzureProvider,
	bitbucket: BitbucketProvider
};

export const getGitProvider = (server: GitServer) => {
	return new __gitProviders[server]();
};

export const GIT_COMMANDS = [
	'add',
	'am',
	'archive',
	'bisect',
	'branch',
	'bundle',
	'checkout',
	'cherry-pick',
	'citool',
	'clean',
	'clone',
	'commit',
	'describe',
	'diff',
	'fetch',
	'format-patch',
	'gc',
	'gitk',
	'grep',
	'gui',
	'init',
	'log',
	'merge',
	'mv',
	'notes',
	'pull',
	'push',
	'range-diff',
	'rebase',
	'reset',
	'restore',
	'revert',
	'rm',
	'shortlog',
	'show',
	'stash',
	'status',
	'submodule',
	'switch',
	'tag',
	'worktree'
];
