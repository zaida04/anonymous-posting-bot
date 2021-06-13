import { Listener } from 'discord-akairo';

export default class DisconnectListener extends Listener {
	public constructor() {
		super('disconnect', {
			emitter: 'client',
			event: 'disconnect'
		});
	}

	public exec() {
		if (this.client.statusInterval) clearInterval(this.client.statusInterval);
		this.client.statusInterval = null;
	}
}
