import { Argv } from 'yargs';

import { catchError } from 'lib/error';
import { checkNodeInstallation, getCurrentPackageJson } from 'lib/node';
import log from 'lib/log';

const name = 'pkg-version';
const description = 'Returns the package version';

const config = (yargs: Argv) => {
	// prettier-ignore
	return yargs
		.usage('foxcli pkg-manager')
		.version(false)
		.help('help')
		.option('help', {  alias: 'h' });
};

const handler = () => {
	catchError(() => {
		checkNodeInstallation();
		log.text(getCurrentPackageJson().version as string);
	});
};

export default { config, description, handler, name };
