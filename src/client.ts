import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { Intents } from 'discord.js';
import { AkClientOptions } from './typings';
import { join } from 'path';

export default class Client extends AkairoClient {
	public constructor(public config: AkClientOptions) {
		super({
			ownerID: [config.ADMIN_ID],
			disableMentions: 'everyone',
			partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
			messageCacheMaxSize: 25,
			messageCacheLifetime: 86400,
			messageSweepInterval: 43200,
			messageEditHistoryMaxSize: 2,
			ws: {
				intents: [Intents.NON_PRIVILEGED]
			}
		});

		this.config = config;

		// boilerplate akairo stuff below
		this.commandHandler = new CommandHandler(this, {
			directory: join(__dirname, 'commands/'),
			prefix: config.PREFIX,
			allowMention: true,
			defaultCooldown: 5000,
			argumentDefaults: {
				prompt: {
					retries: 2,
					retry: 'Not quite what I was looking for, please try saying that again. Be sure to check if I asked you to say this in a specific way like "only say the number"',
					cancel: "A'ight boss, cancelled.",
					ended: 'Cancelled command.',
					timeout:
						'You ran out of time! Please try answering within 120 seconds next time. You can reattempt this command.',
					time: 120000
				}
			}
		});
		this.listenerHandler = new ListenerHandler(this, {
			directory: join(__dirname, 'listeners/')
		});
	}

	private async _init() {
		// boilerplate akairo stuff
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler
		});
		this.commandHandler.loadAll();
		this.listenerHandler.loadAll();
	}

	public info(str: string) {
		return console.log(`\x1b[32m\x1b[1m${str}\x1b[0m`);
	}

	public async login(token: string) {
		await this._init();
		console.log('Logging in...');
		return super.login(token);
	}
}
