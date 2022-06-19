import fs from 'fs';
import path from 'path';
import { execSilent, execSilentWithThrow } from './shell';

type Manager = 'yarn' | 'npm' | 'unknown';

const isRootDir = (dir: string) => {
	const isWin = process.platform === 'win32';
	return (isWin && dir === process.cwd().split(path.sep)[0]) || (!isWin && dir === '/');
};

export const checkNodeInstallation = () => {
	const { code } = execSilent('node --version');
	if (code) throw { code, message: 'Node is not installed' };
};

export const getNodePackageManager = (): Manager => {
	const checkDirectory = (dir: string): Manager => {
		if (fs.existsSync(`${dir}/yarn.lock`)) return 'yarn';
		if (fs.existsSync(`${dir}/package-lock.json`)) return 'npm';
		if (isRootDir(dir)) return 'unknown';
		return checkDirectory(path.resolve(dir, '..'));
	};

	return checkDirectory(process.cwd());
};

export const getCurrentPackageJson = (): Record<string, unknown> => {
	const checkDirectory = (dir: string): Record<string, unknown> => {
		const file = `${dir}/package.json`;
		if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file).toString());
		if (isRootDir(dir)) throw { code: 1, message: 'You are not in a node project.' };
		return checkDirectory(path.resolve(dir, '..'));
	};

	return checkDirectory(process.cwd());
};

export const getPackageVersions = (pkg: string): string[] => {
	const { stdout } = execSilentWithThrow(`npm view ${pkg} versions`);
	const versions = stdout.replace(/'/g, '"');

	try {
		return JSON.parse(versions);
	} catch (e) {
		// Fallback if there is only one version
		return [versions];
	}
};

export const NPM_COMMANDS = [
	'access',
	'adduser',
	'audit',
	'bin',
	'bugs',
	'cache',
	'ci',
	'completion',
	'config',
	'dedupe',
	'deprecate',
	'diff',
	'dist-tag',
	'docs',
	'doctor',
	'edit',
	'exec',
	'explain',
	'explore',
	'fund',
	'help',
	'help-search',
	'hook',
	'init',
	'install',
	'install-ci-test',
	'install-test',
	'link',
	'logout',
	'ls',
	'org',
	'outdated',
	'owner',
	'pack',
	'ping',
	'prefix',
	'profile',
	'prune',
	'publish',
	'rebuild',
	'repo',
	'restart',
	'root',
	'run-script',
	'search',
	'set-script',
	'shrinkwrap',
	'star',
	'stars',
	'start',
	'stop',
	'team',
	'test',
	'token',
	'uninstall',
	'unpublish',
	'unstar',
	'update',
	'version',
	'view',
	'whoami'
];

export const YARN_COMMANDS = [
	'add',
	'audit',
	'autoclean',
	'bin',
	'cache',
	'check',
	'config',
	'create',
	'dedupe',
	'generate-lock-entry',
	'global',
	'help',
	'import',
	'info',
	'init',
	'install',
	'licenses',
	'link',
	'list',
	'lockfile',
	'login',
	'logout',
	'outdated',
	'owner',
	'pack',
	'policies',
	'prune',
	'publish',
	'remove',
	'run',
	'self-update',
	'tag',
	'team',
	'test',
	'unlink',
	'upgrade',
	'upgrade-interactive',
	'version',
	'versions',
	'why',
	'workspace',
	'workspaces'
];
