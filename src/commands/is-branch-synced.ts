import chalk from 'chalk';
import { Argv } from 'yargs';

import { catchError } from 'lib/error';
import {
	checkGitInstallation,
	DEVELOP_BRANCH,
	getCurrentBranch,
	getSourceBranchFromBranch,
	MAIN_BRANCH
} from 'lib/git';
import { execSilentWithThrow } from 'lib/shell';
import log from 'lib/log';

interface CommandArgs {
	from?: string;
}

const name = 'is-branch-synced';
const description = 'Checks if current branch is synchronized with remote branch';

const config = (yargs: Argv) => {
	// prettier-ignore
	return yargs
		.usage('foxcli is-branch-synced [options]')
		.version(false)
		.help('help')
		.option('help', {  alias: 'h'})
		.option('from', {
			alias: 'f',
			describe: 'Use custom branch to check sync if current branch is synced with',
			type: 'string'
		});
};

const handler = (args: CommandArgs) => {
	catchError(() => {
		checkGitInstallation();

		const currentBranch = getCurrentBranch();
		if ([MAIN_BRANCH, DEVELOP_BRANCH].includes(currentBranch)) {
			return log.warn(`You are in a source branch: ${chalk.bold.underline(currentBranch)}. Doing nothing.`);
		}

		const sourceBranch = args.from || getSourceBranchFromBranch(currentBranch);
		log.info('Fetching from remote...');
		execSilentWithThrow('git fetch');
		log.info('Checking sync status...');
		const { stdout: baseCommonCommit } = execSilentWithThrow(`git merge-base ${currentBranch} origin/${sourceBranch}`);
		const lastRemoteSourceBranchCommit = execSilentWithThrow(
			`git log -n 1 --pretty=format:"%H" origin/${sourceBranch}`
		).stdout.replace(new RegExp('"', 'g'), '');
		if (baseCommonCommit === lastRemoteSourceBranchCommit) {
			log.success('Current branch is synced');
		} else {
			throw { error: 1, message: 'Current branch is not synced with remote' };
		}
	});
};

export default { config, description, handler, name };
