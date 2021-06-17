import { Client, Message, MessageEmbed, WebhookClient, Util, Guild, Constants, Collection } from 'discord.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';
import { builder, InputError, transformTextToEmbed } from './utils';
import { YAMLConfig } from './typings';
import * as CONSTANTS from './consts';

const botConfig = {
	TOKEN: process.env.DISCORD_TOKEN!,
	GLOBAL_PREFIX: '!'
};
const context = {
	currentlyExecutingCommand: new Set<string>(),
	alreadyAgreed: new Set<string>(),
	cachedWebhooks: new Collection<string, WebhookClient>()
};
const client = new Client({
	messageCacheLifetime: 60,
	messageCacheMaxSize: 1,
	messageEditHistoryMaxSize: 1,
	messageSweepInterval: 900000,
	disableMentions: 'everyone',
	ws: {
		intents: CONSTANTS.CLIENT_INTENTS
	}
});
const preparsedYAML = readFileSync(join(__dirname, '..', 'config.yml'), 'utf8');
const yamlConfig: YAMLConfig = yaml.parse(preparsedYAML);
const { promptForChannel, getWebhook, getLogChannel, promptYesOrNo, promptForGuild, exitPrompt } = builder(
	client,
	botConfig,
	yamlConfig,
	context
);

client.on(Constants.Events.CLIENT_READY, () => {
	console.log(CONSTANTS.CLIENT_LOGGED_IN(client.user!.tag));
});

client.on(Constants.Events.MESSAGE_CREATE, async (msg: Message) => {
	if (msg.channel.type !== 'dm' || msg.author.bot || !msg.content.startsWith(botConfig.GLOBAL_PREFIX))
		return;
	const [commandName, ...args] = msg.content.slice(botConfig.GLOBAL_PREFIX.length).trim().split(/ +/);

	switch (commandName) {
		case 'anon':
		case 'anonymous': {
			// pre-check
			if (context.currentlyExecutingCommand.has(msg.author.id))
				return msg.channel.send(
					transformTextToEmbed(CONSTANTS.COMMAND_ALREADY_STARTED, CONSTANTS.ERROR_COLOR)
				);
			if (!args.length)
				return msg.channel.send(
					transformTextToEmbed(
						CONSTANTS.PROVIDE_ARGS(botConfig.GLOBAL_PREFIX, commandName),
						CONSTANTS.ERROR_COLOR
					)
				);
			context.currentlyExecutingCommand.add(msg.author.id);

			try {
				// prompt guild
				await msg.channel.send(transformTextToEmbed(CONSTANTS.PROVIDE_GUILD, CONSTANTS.PROMPT_COLOR));
				const guild: Guild = await promptForGuild(msg.channel, msg.author);
				if (!guild) throw new InputError(CONSTANTS.GUILD_NOT_FOUND);

				// prompt channel
				await msg.channel.send(
					transformTextToEmbed(CONSTANTS.PROVIDE_CHANNEL, CONSTANTS.PROMPT_COLOR)
				);
				const channelDest = await promptForChannel(msg.channel, msg.author, guild);
				if (!channelDest) throw new InputError(CONSTANTS.CHANNEL_NOT_FOUND);

				// find webhook
				const webhook = getWebhook(guild.id, channelDest.id);
				if (!webhook) throw new InputError(CONSTANTS.CHANNEL_ANON_NOT_ENABLED);
				const webhookInstance =
					context.cachedWebhooks.get(channelDest.id) ??
					new WebhookClient(webhook.webhook_id, webhook.webhook_token);

				// agreement
				if (
					!context.alreadyAgreed.has(msg.author.id) &&
					!(await promptYesOrNo(
						new MessageEmbed()
							.setTitle(CONSTANTS.DISCLAIMER_MESSAGE_HEADER)
							.setDescription(CONSTANTS.DISCLAIMER_MESSAGE)
							.setColor(CONSTANTS.ERROR_COLOR),
						{ message: msg }
					))
				) {
					return context.currentlyExecutingCommand.delete(msg.author.id);
				}

				// cache agreed person
				context.alreadyAgreed.add(msg.author.id);

				const logChannel = getLogChannel(guild);
				if (!logChannel) throw new InputError(CONSTANTS.CONFIGURATION_ERROR);

				const conf = yamlConfig.guilds.find((x) => x.id === guild.id);

				const content = Util.escapeMarkdown(args.join(' '));
				const m = await webhookInstance.send(`**New Anonymous post:** \`${content}\``, {
					avatarURL: conf!.webhook_icon_url,
					username: conf!.webhook_name
				});
				await logChannel.send(
					CONSTANTS.NEW_POST_MESSAGE,
					new MessageEmbed().addFields([
						{
							name: 'Author (sensitive info)',
							value: msg.author,
							inline: true
						},
						{
							name: 'Content',
							value: `\`\`\`${content}\`\`\``,
							inline: false
						}
					])
				);
				return msg.channel.send(
					transformTextToEmbed(CONSTANTS.ANON_MESSAGE_SUCCESS, CONSTANTS.SUCCESS_COLOR)
				);
			} catch (e) {
				if (e instanceof InputError) {
					console.log(
						`[INFO] User ${msg.author.tag} (${msg.author.id}) caused an input error. ${e.message}`
					);
					msg.reply(transformTextToEmbed(e.message, CONSTANTS.ERROR_COLOR));
				} else {
					console.log(
						`[ERR] User ${msg.author.tag} (${
							msg.author.id
						}) flow caused an error. ${e.toString()}`
					);
					msg.reply(transformTextToEmbed(CONSTANTS.ERROR_OCCURED, CONSTANTS.ERROR_COLOR));
				}
			} finally {
				exitPrompt(msg.author);
			}
		}
	}
});

(() => {
	for (const prop in botConfig) {
		if (!botConfig[prop]) throw new Error(CONSTANTS.MISSING_ENV_VAR(prop));
	}
	void client.login(process.env.DISCORD_TOKEN);
})();
