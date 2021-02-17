import log from 'lib/log';

/**
 * Throw example without message:
 * throw { code: 10 };
 *
 * Throw example with message:
 * throw { code: 1, message: 'Some error ocurred' };
 */
const catchError = async (fn: (...args: unknown[]) => unknown | Promise<unknown>) => {
	try {
		await fn();
	} catch (e) {
		if (e.message) log.error(`⚠️ ERROR: ${e.message}`);
		process.exit(e.code || 1);
	}
};

export { catchError };
