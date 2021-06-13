import Client from './client';

const envs = ['ADMIN_ID', 'PREFIX', 'TOKEN', 'GUILD'];

// check if all env variables are here
for (const env of envs) {
	if (!process.env[env]) throw new Error(`Missing env variable ${env}`);
}

const client = new Client({
	ADMIN_ID: process.env.ADMIN_ID!,
	PREFIX: process.env.PREFIX!,
	GUILD: process.env.GUILD!
});

// start bot
void client.login(process.env.TOKEN!);
