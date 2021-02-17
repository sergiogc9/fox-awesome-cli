import shell from 'shelljs';

const checkGitInstallation = () => {
	const { code } = shell.exec('git --version', { silent: true });
	if (code) throw { code, message: 'Git is not installed' };
};

export { checkGitInstallation };
