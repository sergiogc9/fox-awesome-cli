import path from 'path';
import { Argv } from 'yargs';

import { catchError } from 'lib/error';
import { execWithThrow } from 'lib/shell';

interface CommandArgs {
	node?: boolean;
	json?: boolean;
}

const name = 'info';
const description = 'Shows info about the system, node, git and others';

const config = (yargs: Argv) => {
	return yargs
		.usage('foxcli info [options]')
		.version(false)
		.help('help')
		.option('help', { alias: 'h' })
		.option('node', {
			describe: 'Show node related info',
			type: 'boolean'
		})
		.option('json', {
			describe: 'Show data in JSON format',
			type: 'boolean'
		});
};

const handler = async (args: CommandArgs) => {
	catchError(() => {
		const envInfoArgs: string[] = [];
		if (args.node) envInfoArgs.push('--system', '--binaries', '--npmPackages', '--npmGlobalPackages', '--duplicate');
		if (args.json) envInfoArgs.push('--json');
		execWithThrow(`${path.resolve(__dirname, '../node_modules/.bin/envinfo')} ${envInfoArgs.join(' ')}`);
	});
};

export default { config, description, handler, name };
