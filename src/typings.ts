export interface YAMLConfig {
	guilds: {
		id: string;
		prefix: string;
		log_channel: string;
		webhook_name: string;
		webhook_icon_url: string;
		channel_webhooks: {
			channel_id: string;
			webhook_token: string;
			webhook_id: string;
		}[];
	}[];
}
