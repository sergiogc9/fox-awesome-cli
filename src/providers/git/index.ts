import configStore from 'lib/config';

abstract class GitProvider {
	protected __server: GitServer;

	public abstract createPullRequest: (options: {
		from: string;
		to: string;
		title: string;
		description: string;
		isDraft: boolean;
	}) => Promise<string>;

	protected __askProviderToken: () => Promise<string>;

	protected __getProviderToken = async () => {
		if (!this.__server) throw { message: "That's weird... Git provider not initialized!" };

		const configKey = `git.providers.${this.__server}.token`;
		let token: string = configStore.get(configKey);
		if (!token) {
			token = await this.__askProviderToken();

			if (!token) throw { message: 'Token not provided, exiting.' };
			configStore.set(configKey, token);
		}
		return token;
	};
}

export default GitProvider;
