import { Argv } from 'yargs';

import * as git from 'lib/git';
import { catchError } from 'lib/error';
import { execSilent, execWithThrow } from 'lib/shell';
import log from 'lib/log';

const name = 'push';
const description = 'Improved git push command';

const config = (yargs: Argv) => {
	return yargs.usage('foxcli push [options]').version(false).help('help').option('help', { alias: 'h' });
};

const handler = (args: string[]) => {
	catchError(async () => {
		git.checkGitInstallation();

		const fullCommand = args.join(' ');
		const { code, stdout, stderr, error } = execSilent(`git ${fullCommand}`);
		console.log(stdout);
		console.error(stderr);

		// If branch is not already pushed
		if (code === 128 && stderr.match(/The current branch .* has no upstream branch/)) {
			log.info('Branch is not already pushed into remote. Pushing it...');
			const currentBranch = git.getCurrentBranch();
			execWithThrow(`git push --set-upstream origin ${currentBranch}`);
		} else if (code) {
			throw { code, message: error };
		}
	});
};

export default { config, description, handler, name };
