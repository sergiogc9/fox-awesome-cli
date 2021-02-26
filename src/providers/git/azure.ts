import inquirer from 'inquirer';

import configStore from 'lib/config';
import GitProvider from 'providers/git';

class AzureProvider extends GitProvider {
	constructor() {
		super();
		this.__server = 'azure';
	}

	public createPullRequest: GitProvider['createPullRequest'] = async options => {
		// TODO
		console.log(options);
		return 'https';
	};

	protected __askProviderToken: GitProvider['__askProviderToken'] = async () => {
		// TODO
		return 'A';
	};
}

export default AzureProvider;
