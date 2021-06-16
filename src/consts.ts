export const COMMAND_ALREADY_STARTED = 'Please finish the command you are already doing first!' as const;
export const PROVIDE_ARGS = (p: string, c: string) => `Please add a message after \`${p}${c}\`` as const;
export const PROVIDE_GUILD =
	'Please provide the name or ID of a server you wish to send this message anonymously to.' as const;
export const GUILD_NOT_FOUND = 'Could not find that server! Cancelled command.' as const;
export const PROVIDE_CHANNEL =
	'Please provide the channel name or ID of the channel you wish to anonymously post to.' as const;
export const CHANNEL_NOT_FOUND = 'Could not find that channel! Cancelled command.' as const;
export const CHANNEL_ANON_NOT_ENABLED = 'You cannot send anonymous messages to that channel!' as const;
export const DISCLAIMER_MESSAGE_HEADER = 'Terms & Conditions' as const;
export const DISCLAIMER_MESSAGE =
	'Please do not abuse or use this system for inappropriate or dangerous reasons. **Your username is logged only for moderation purposes and is not revealed to anyone besides the server staff**.\n\nPlease indicate whether you agree to these terms by saying either **YES** or **NO**.' as const;
export const CONFIGURATION_ERROR =
	'Configuration error! Please forward this to a moderator! Error: `Cannot find log channel`' as const;
export const NEW_POST_MESSAGE = 'New Anonymous post' as const;
export const ANON_MESSAGE_SUCCESS = 'Successfully sent your message!' as const;
export const ERROR_OCCURED =
	'Sorry, but an error occurred! Please let the server moderators know about this!' as const;
export const CLIENT_LOGGED_IN = (name: string) => `Logged in as ${name}` as const;
export const CLIENT_INTENTS = ['DIRECT_MESSAGES', 'GUILDS', 'GUILD_MESSAGES', 'GUILD_WEBHOOKS'] as const;
export const MISSING_ENV_VAR = (p: string) => `Missing env var for ${p}` as const;
export const PROMPT_COLOR = 'GOLD' as const;
export const ERROR_COLOR = 'RED' as const;
export const SUCCESS_COLOR = 'GREEN' as const;
