import execa from 'execa';

/**
 * Executes a command showing stderr and stdout in screen. Returns the exit code and the error message if failed.
 */
export const exec = (cmd: string): { code: number; error?: string } => {
	try {
		const { exitCode } = execa.commandSync(cmd, { stdio: 'inherit' });
		return { code: exitCode };
	} catch (e) {
		return { code: e.exitCode || 1, error: e.shortMessage };
	}
};

/**
 * Executes a command showing stderr and stdout in screen. Returns the exit code if success and throws an error if fails.
 */
export const execWithThrow = (cmd: string): { code: number } => {
	try {
		const { exitCode } = execa.commandSync(cmd, { stdio: 'inherit' });
		return { code: exitCode };
	} catch (e) {
		throw { code: e.exitCode || 1, message: e.shortMessage };
	}
};

/**
 * Executes a command returning stderr and stdout (i.e. not showing in screen).
 * Returns the exit code, stderr and stdout. Returns the error message if failed.
 */
export const execSilent = (cmd: string): { code: number; stderr: string; stdout: string; error?: string } => {
	try {
		const { exitCode, stderr, stdout } = execa.commandSync(cmd, { stdio: 'pipe' });
		return { code: exitCode, stderr, stdout };
	} catch (e) {
		return { code: e.exitCode || 1, stderr: e.stderr, stdout: e.stdout, error: e.shortMessage };
	}
};

/**
 * Executes a command returning stderr and stdout (i.e. not showing in screen).
 * Returns the exit code, stderr and stdout if success. Throws an error if fails.
 */
export const execSilentWithThrow = (cmd: string): { code: number; stderr: string; stdout: string } => {
	try {
		const { exitCode, stderr, stdout } = execa.commandSync(cmd, { stdio: 'pipe' });
		return { code: exitCode, stderr, stdout };
	} catch (e) {
		throw { code: e.exitCode || 1, message: e.stderr };
	}
};
