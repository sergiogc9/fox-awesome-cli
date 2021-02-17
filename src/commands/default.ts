import chalk from 'chalk';
import figlet from 'figlet';

import { catchError } from 'lib/error';
import log from 'lib/log';
import { GIT_COMMANDS } from 'lib/git';
import { getNodePackageManager, NPM_COMMANDS, YARN_COMMANDS } from 'lib/node';
import { exec } from 'lib/shell';

const handler = (args: string[]) => {
	catchError(() => {
		if (args.length) {
			const command = args[0];
			const fullCommand = args.join(' ');

			if (GIT_COMMANDS.includes(command)) return exec(`git ${fullCommand}`);

			const pkgManager = getNodePackageManager();
			if (pkgManager === 'yarn' && YARN_COMMANDS.includes(command)) return exec(`yarn ${fullCommand}`);
			if (pkgManager === 'npm' && NPM_COMMANDS.includes(command)) return exec(`npm ${fullCommand}`);

			throw { message: `The command ${command} does not exist.` };
		} else {
			log.text(figlet.textSync('Fox awesome cli', {}), chalk.keyword('orange').bold);
			log.text(`\nDocs: ${chalk.blueBright.bold('https://github.com/sergiogc9/fox-awesome-cli')}\n`);
			exec('foxcli --help');
		}
	});
};

export default handler;
