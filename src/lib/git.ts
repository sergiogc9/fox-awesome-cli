import { execSilent, execSilentWithThrow } from 'lib/shell';

export const checkGitInstallation = () => {
	const { code } = execSilent('git --version');
	if (code) throw { code, message: 'Git is not installed' };
};

export const getCurrentBranch = () => execSilentWithThrow('git branch --show-current').stdout.trim();

export const existsLocalBranch = (branch: string) =>
	execSilentWithThrow(`git branch --list ${branch}`).stdout.trim() === branch || getCurrentBranch() === branch;

export const existsRemoteBranch = (branch: string) =>
	execSilentWithThrow(`git ls-remote --heads origin ${branch}`).stdout.trim() !== '';

export const getSourceBranchFromBranch = (branch: string) =>
	/^(hotfix|release)(\/|-).*/.test(branch) ? 'master' : 'develop';

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
