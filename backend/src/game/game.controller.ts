import { Controller, Get, Post, Body, Param, Patch, Delete, BadRequestException, Logger, Request} from '@nestjs/common';
import { GameService } from './game.service';
import { get } from 'http';
import { GameSpectateDto } from './dto/game.dto';


@Controller('game')
export class GameController {

	private logger: Logger = new Logger ("Game Controller")
    constructor(private gameService : GameService) {
    }

    @Get ("match-history/:id")
    async getMatchHistory(@Param ("id") userId: string): Promise<any[]>
    {
		try
		{
        	return await this.gameService.getMatchHistory(userId);
		}
		catch
		{
			throw new BadRequestException ("Could not get match history");
		}
	}

	@Get("Spectate")
	async getSpectateList() : Promise<GameSpectateDto> {
		try
		{
			let gamesSpectate = await this.gameService.getPlayingGames()
			console.log(gamesSpectate)
			return (gamesSpectate)
		}
		catch
		{
			throw new BadRequestException ("Could not get spectators list");
		}
	}

    @Post()
    createInvite(@Request() req) : Promise<string> {
		try
		{
			let result = this.gameService.createInvite(req.user.id)
			return (result)
		}
		catch(err)
		{
			this.logger.error(err)
			throw new BadRequestException(err.message)
		}
    }
}
