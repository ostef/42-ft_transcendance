import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { GameService } from './game.service';
import { Todo } from './interfaces/game.interface';
import { CreateTodoDto } from './dto/createTodo.dto';


@Controller('game')
export class GameController {

    constructor(private readonly gameService: GameService) {}

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

    //Todo Creer la class game controller, qui va creer une game et la faire tourner
    //et envoyer les infos au front au fur et a mesure de l'avancee de la partie
    //en utilisant socket.io
}
