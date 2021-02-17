import chalk from 'chalk';
import { Argv } from 'yargs';

import { catchError } from 'lib/error';
import { checkGitInstallation } from 'lib/git';
import { exec, execSilentWithThrow } from 'lib/shell';
import log from 'lib/log';

interface CommandArgs {
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

		const currentBranch = execSilentWithThrow('git branch --show-current').stdout.trim();
		if (['master', 'develop'].includes(currentBranch)) {
			return log.warn(`You are in a source branch: ${chalk.bold.underline(currentBranch)}. Doing nothing.`);
		}

		const sourceBranch = /^(hotfix|release)(\/|-).*/.test(currentBranch) ? 'master' : 'develop';
		const params = args.rebase ? '--rebase' : '';
		const { code } = exec(`git pull origin ${sourceBranch} ${params}`);
		if (code) throw { code };
	});
};

export default { config, description, handler, name };
