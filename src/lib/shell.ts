import shell from 'shelljs';

const execWithThrow = (cmd: string, silent = false) => {
	const { code, stderr, stdout } = shell.exec(cmd, { silent });
	if (code) throw { code, message: stderr };
	return { code, stderr, stdout };
};

export { execWithThrow };
