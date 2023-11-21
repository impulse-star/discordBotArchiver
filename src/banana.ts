import { createHash } from 'crypto';

export const DISCORD_LINK_REGEX = /(https:\/\/cdn\.discordapp\.com\/attachments\/\d+)|(https:\/\/media\.discordapp\.net\/attachments\/\d+)/g;
export const FILE_TO_WRITE_TO = './links.txt';
export function GetSha256Hash(input: object): string {
	return createHash('sha256').update(input.toString()).digest('hex');
}
export function GetRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}