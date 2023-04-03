import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "../users/user.entity";
import { ChannelService } from "./channel.service";
import { Channel } from "./entities/channel.entity";
import { ChannelInvite } from "./entities/invite.entity";

@Injectable ()
export class InviteService
{
	constructor (
		@InjectRepository (ChannelInvite)
		private inviteRepository: Repository<ChannelInvite>,

		private channelService: ChannelService,
	) {}

	/*
	inviteExists (fromUser: User, toUser: User, channel: Channel): boolean
	{
		return false;
	}

	inviteUser (fromUser: User, toUser: User, channel: Channel): void
	{
		// Check that fromUser is in channel
		if (!this.channelService.isUserInChannel (fromUser, channel))
			return;

		// Check that toUser is not in channel
		if (this.channelService.isUserInChannel (toUser, channel))
			return;

		// Check if an invite has already been sent (if yes, just change the date)
		if (this.inviteExists (fromUser, toUser, channel))
			return;

		// Save new invite
		const invite = new ChannelInvite ();
		invite.channel = channel;
		invite.fromUser = fromUser;
		invite.toUser = toUser;

		this.inviteRepository.save (invite);
	}

	acceptInvite (invite: ChannelInvite): void
	{}

	declineInvite (invite: ChannelInvite): void
	{}
	*/
}
