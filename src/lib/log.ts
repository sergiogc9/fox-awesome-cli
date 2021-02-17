import chalk from 'chalk';

class Log {
	public text = (text: string, chalkModifier: chalk.Chalk = chalk) => {
		console.log(chalkModifier(text));
	};

	public info = (text: string, chalkModifier: chalk.Chalk = chalk) => {
		console.log(chalkModifier.blueBright(text));
	};

	public warn = (text: string, chalkModifier: chalk.Chalk = chalk) => {
		console.log(chalkModifier.yellowBright(text));
	};

	public error = (text: string, chalkModifier: chalk.Chalk = chalk) => {
		console.error(chalkModifier.redBright(text));
	};
}

export default new Log();
