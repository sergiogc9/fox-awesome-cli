import chalk from 'chalk';
import figlet from 'figlet';

import { catchError } from 'lib/error';
import log from 'lib/log';
import { GIT_COMMANDS } from 'lib/git';
import { getCurrentPackageJson, getNodePackageManager, NPM_COMMANDS, YARN_COMMANDS } from 'lib/node';
import { exec, execWithThrow } from 'lib/shell';

const handler = (args: string[]) => {
	catchError(() => {
		if (args.length) {
			const command = args[0];
			const fullCommand = args.join(' ');

			if (GIT_COMMANDS.includes(command)) return execWithThrow(`git ${fullCommand}`);

			const pkgManager = getNodePackageManager();
			let pkgJson;
			try {
				pkgJson = getCurrentPackageJson();
			} catch (e) {} // eslint-disable-line no-empty
			if (pkgManager === 'yarn') {
				if (YARN_COMMANDS.includes(command)) return execWithThrow(`yarn ${fullCommand}`);
				if (pkgJson && (pkgJson.scripts as Record<string, unknown>)[command])
					return execWithThrow(`yarn ${fullCommand}`);
			} else if (pkgManager === 'npm') {
				if (NPM_COMMANDS.includes(command)) return execWithThrow(`npm ${fullCommand}`);
				if (pkgJson && (pkgJson.scripts as Record<string, unknown>)[command])
					return execWithThrow(`npm run ${fullCommand}`);
			}

			throw { message: `The command ${command} does not exist.` };
		} else {
			log.text(figlet.textSync('Fox awesome cli', {}), chalk.keyword('orange').bold);
			log.text(`\nDocs: ${chalk.blueBright.bold('https://github.com/sergiogc9/fox-awesome-cli')}\n`);
			exec('foxcli --help');
		}
	});
};

export default handler;
