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
import { exec } from 'lib/shell';
import log from 'lib/log';

interface CommandArgs {
	from?: string;
	rebase?: boolean;
}

const name = 'branch-sync';
const description = 'Updates current branch with remote changes.';

const config = (yargs: Argv) => {
	// prettier-ignore
	return yargs
		.usage('foxcli branch-sync [options]')
		.version(false)
		.help('help')
		.option('help', {  alias: 'h'})
		.option('from', {
			alias: 'f',
			describe: 'Use custom source branch to sync the current branch from',
			type: 'string'
		})
		.option('rebase', {
			alias: 'r',
			default: false,
			describe: 'Use rebase when syncing',
			type: 'boolean'
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
		const params = args.rebase ? '--rebase' : '';
		const { code } = exec(`git pull origin ${sourceBranch} --ff ${params}`);
		if (code) throw { code };
	});
};

export default { config, description, handler, name };
