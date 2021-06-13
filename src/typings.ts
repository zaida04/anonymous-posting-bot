import { Guild } from 'discord.js';
import { CommandHandler, ListenerHandler } from 'discord-akairo';

export interface AkClientOptions {
	ADMIN_ID: string;
	PREFIX: string;
	GUILD: string;
}

declare module 'discord-akairo' {
	interface AkairoClient {
		statusInterval: NodeJS.Timeout | null;
		commandHandler: CommandHandler;
		listenerHandler: ListenerHandler;
		guild?: Guild;
		config: AkClientOptions;
		info(str: string): void;
	}
}
