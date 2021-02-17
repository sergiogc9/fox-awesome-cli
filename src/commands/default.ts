import chalk from 'chalk';
import figlet from 'figlet';
import shell from 'shelljs';

import { catchError } from 'lib/error';
import log from 'lib/log';

interface CommandArgs {
	_: unknown;
}

const handler = (args: CommandArgs) => {
	catchError(() => {
		const cmdArgs = args._ as string[];
		if (cmdArgs.length) {
			const command = cmdArgs[0];
			console.log(command);

			throw { message: `The command ${command} does not exist.` };
		} else {
			log.text(figlet.textSync('Fox awesome cli', {}), chalk.keyword('orange').bold);
			log.text(`\nDocs: ${chalk.blueBright.bold('https://github.com/sergiogc9/fox-awesome-cli')}\n`);
			shell.exec('foxcli --help');
		}
	});
};

export default handler;
