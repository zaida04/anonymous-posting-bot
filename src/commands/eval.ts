import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import fetch from 'node-fetch';
import { inspect } from 'util';

export default class Eval extends Command {
	public constructor() {
		super('eval', {
			aliases: ['eval'],
			ratelimit: 2,
			cooldown: 20000,
			args: [
				{
					id: 'code',
					type: 'string',
					match: 'rest'
				}
			],
			channel: 'guild',
			ownerOnly: true
		});
	}

	// Borrowed from didinele, https://github.com/weeb-cafe/MewChan/blob/master/packages/bot/src/commands/dev/eval.ts

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private async _clean(text: any) {
		if (text?.then && text.catch) text = await text;
		if (typeof text !== 'string') text = inspect(text, { depth: 0 });

		return (text as string)
			.replace(/`/g, `\`${String.fromCharCode(8203)}`)
			.replace(/@/g, `@${String.fromCharCode(8203)}`)
			.replace(process.env.TOKEN!, "this is supposed to be the bot's token");
	}

	private _tooLong(body: string): Promise<string> {
		return fetch('https://paste.discord.land/documents', { method: 'POST', body }).then((d) =>
			d.json().then((v) => v.key)
		);
	}

	public async exec(msg: Message, { code }: { code: string }) {
		if (!code) return msg.channel.send('Gotta give me something to eval there chief.');
		const codeblock = (content: string) => `\`\`\`js\n${content}\`\`\``;
		try {
			const evaled = eval(`(async () => {${code}})()`); // eslint-disable-line no-eval
			const clean = await this._clean(evaled);
			const final = stripIndents`
                📥 **Input**
                ${codeblock(code)}
                📤 **Output**
                ${codeblock(clean)}
                `;

			if (final.length > 2000) {
				const key = await this._tooLong(clean);
				return msg.util!.send(
					`Output exceeded 2000 characters (${final.length}). https://paste.discord.land/${key}.js`
				);
			}

			await msg.channel.send(final);
		} catch (e) {
			const clean = await this._clean(e);
			const final = stripIndents`
                📥 **Input**
                ${codeblock(code)}
                📤 **Error**
                ${codeblock(clean)}
                `;

			if (final.length > 2000) {
				const key = await this._tooLong(clean);
				return msg.channel.send(
					`Error exceeded 2000 characters (${final.length}). https://paste.discord.land/${key}.js`
				);
			}

			await msg.channel.send(final);
		}
	}
}
