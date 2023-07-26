import { Controller, Get, Post, Body, Param, Patch, Delete, BadRequestException, Logger, Request} from '@nestjs/common';
import { GameService } from './game.service';
import { get } from 'http';
import { GameSpectateDto } from './dto/game.dto';


@Controller('game')
export class GameController {

	private logger: Logger = new Logger ("Game Controller")
    constructor(private gameService : GameService) {
    }
    /*Tests avec des todos pour apprendre
    @Get(':id')
        findone(@Param('id') id : number) {
    }

    @Get()
        findall() : Todo[] {
        return this.gameService.findAll(); 
    }

    @Post()
        createTodo(@Body() newTodo : CreateTodoDto) {
        this.createTodo(newTodo);
    }

    @Patch(':id') //Todo si le number pour le type de id marche pas, passer en string et convertir avec +
    updateTodo(@Param('id') id : number, @Body() todo: CreateTodoDto) {
        this.gameService.updateTodo(id, todo)
    }

    @Delete(':id')
    deleteTodo(@Param('id') id : number) {
        return this.gameService.deleteTodo(id);
    }*/

    @Get('matchHistory/:id')
     getMatchHistory(@Param('id') id : string) {
        return this.gameService.getMatchHistory(id);
    }

	@Get("Spectate")
	async getSpectateList() : Promise<GameSpectateDto> {
		let gamesSpectate = await this.gameService.getPlayingGames()
		console.log(gamesSpectate)
		return (gamesSpectate)
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
