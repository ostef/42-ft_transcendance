import { Controller, Get, Post, Body, Param, Patch, Delete} from '@nestjs/common';
import { GameService } from './game.service';


@Controller('game')
export class GameController {

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

    @Post()
    createInvite() : number {
        return (this.gameService.createInvite())
    }
        

}
