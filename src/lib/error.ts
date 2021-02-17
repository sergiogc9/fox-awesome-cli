import shell from 'shelljs';

import log from 'lib/log';

/**
 * Throw example without message:
 * throw { code: 10 };
 *
 * Throw example with message:
 * throw { code: 1, message: 'Some error ocurred' };
 */
const catchError = (fn: (...args: unknown[]) => unknown) => {
	try {
		fn();
	} catch (e) {
		if (e.message) log.error(`⚠️ ERROR: ${e.message}`);
		shell.exit(e.code || 1);
	}
};

export { catchError };
