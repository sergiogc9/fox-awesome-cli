import fs from 'fs';
import path from 'path';
import shell from 'shelljs';
import { execWithThrow } from './shell';

type Manager = 'yarn' | 'npm' | 'unknown';

const isRootDir = (dir: string) => {
	const isWin = process.platform === 'win32';
	return (isWin && dir === process.cwd().split(path.sep)[0]) || (!isWin && dir === '/');
};

export const checkNodeInstallation = () => {
	const { code } = shell.exec('node --version', { silent: true });
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
	const versions = execWithThrow(`npm view ${pkg} versions`, true).stdout.replace(/'/g, '"');

	return JSON.parse(versions);
};
