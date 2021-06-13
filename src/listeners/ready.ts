import { Listener } from 'discord-akairo';
import { ActivityType } from 'discord.js';

export default class ReadyListener extends Listener {
	public status: { type: ActivityType; name: string }[] = [
		{
			type: 'COMPETING',
			name: 'STATUS_1'
		},
		{
			type: 'WATCHING',
			name: 'STATUS_2'
		},
		{
			type: 'WATCHING',
			name: 'STATUS_3'
		}
	];

	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready'
		});
	}

	public async exec() {
		// below code checks to make sure the specified guild, modmail category, and modmail main channel are valid.

		this.client.info(`Bot logged in as ${this.client.user!.tag}`);
		if (!this.client.guilds.cache.has(this.client.config.GUILD))
			throw new Error('Cannot find the specified Guild!');
		this.client.guild = this.client.guilds.cache.get(this.client.config.GUILD);

		return this.rotateStatus();
	}

	public rotateStatus() {
		void this.changeStatus();
		this.client.statusInterval = setInterval(this.changeStatus, 1000 * 60 * 15);
	}

	public changeStatus() {
		return this.client.user!.setPresence({
			activity: this.status[Math.floor(Math.random() * this.status.length)],
			status: 'online'
		});
	}
}
