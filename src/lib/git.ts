import { execSilent } from 'lib/shell';

export const checkGitInstallation = () => {
	const { code } = execSilent('git --version');
	if (code) throw { code, message: 'Git is not installed' };
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
