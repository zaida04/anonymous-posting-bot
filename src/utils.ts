import { DMChannel, Guild, Message, MessageEmbed, TextChannel, User } from 'discord.js';
import { YAMLConfig } from './typings';

export const builder = (client, global_config, yamlConfig: YAMLConfig, context) => {
	return {
		promptForGuild: async (channel: DMChannel, author: User) => {
			const response = await channel
				.awaitMessages((m: Message) => m.author.id === author.id, {
					max: 1,
					time: 60000,
					errors: ['time']
				})
				.then((x) => x.first());

			if (!response?.content) return null;

			const foundGuild =
				client.guilds.cache.get(response.content) ??
				(client.guilds.cache.find((x) =>
					Boolean(x.name.toLowerCase().includes(response.content.toLowerCase()) ?? false)
				) as Guild | undefined);

			return foundGuild ?? null;
		},
		promptForChannel: async (channel: DMChannel, author: User, guild: Guild) => {
			const response = await channel
				.awaitMessages((m: Message) => m.author.id === author.id, {
					max: 1,
					time: 60000,
					errors: ['time']
				})
				.then((x) => x.first());

			if (!response?.content) return null;

			const foundChannel =
				guild?.channels.cache.get(response.content) ??
				(guild?.channels.cache
					.filter((x) => x.type === 'text')
					.find((x) => Boolean(x.name.toLowerCase().includes(response.content) ?? false)) as
					| TextChannel
					| undefined);

			return foundChannel ?? null;
		},
		getWebhook: (guildId: string, channelId: string) => {
			return yamlConfig.guilds
				.find((x) => x.id === guildId)
				?.channel_webhooks.find((x) => x.channel_id === channelId);
		},
		getLogChannel: (guild: Guild) => {
			const channelId = yamlConfig.guilds.find((x) => x.id === guild.id)?.log_channel;

			const logChannel = channelId ? guild.channels.cache.get(channelId) : null;
			return logChannel as TextChannel | null;
		},
		promptYesOrNo: async (question: string | MessageEmbed, { message }: { message: Message }) => {
			await message.channel.send(question instanceof MessageEmbed ? question : `${question}`);
			const responses = await message.channel.awaitMessages(
				(msg: Message) => msg.author.id === message.author.id,
				{
					max: 1,
					time: 60000
				}
			);

			if (responses.size !== 1) {
				void message.channel.send('You ran out of time to respond! Please try again.');
				return false;
			}

			const response = responses.first();
			if (!/^y(?:e(?:a|s)?)?$/i.test(response?.content ?? '')) {
				void message.channel.send('Cancelled command.');
				return false;
			}

			return true;
		},
		exitPrompt: (user: User) => {
			return context.currentlyExecutingCommand.delete(user.id);
		}
	};
};

export const transformTextToEmbed = (str: string, color?: string) =>
	new MessageEmbed().setTitle(str).setColor(color?.toUpperCase() ?? 'GREEN');

export class InputError extends Error {}
