import { Injectable, NotFoundException } from '@nestjs/common';
import { Todo } from './interfaces/game.interface';
import { CreateTodoDto } from './dto/createTodo.dto';

@Injectable()
export class GameService {

    todos : Todo[] = [
        {
            id : 1,
        },
        {
            id : 2,
        }
    ];

    findOne(id : number) {
        return this.todos.find(todo => todo.id === id)
    }

    findAll() : Todo[] {
        return this.todos
    }

    createTodo(todo : CreateTodoDto) {
        this.todos = [...this.todos, todo]
    }

    updateTodo(id : number, todo : CreateTodoDto) {
        //Finding the todo to updte
        const todoToUpdate =  this.todos.find( t => t.id === id)
        if (!todoToUpdate) {
            return new NotFoundException('Todo not found to update')
        }

        //Updating the todo without it having every propertys from todos
        if (todo.hasOwnProperty('id'))
        {
            todoToUpdate.id = todo.id
        }
        //We should do this for every property possible to modify !

        //Updating the todos !

        const updatedTodos =  this.todos.map(t => t.id !== id ? t : todoToUpdate)
        this.todos = updatedTodos

        //We return some info on what we did here just for good practice
        return {updatedTodo : 1, todo : todoToUpdate}
    }

    deleteTodo(id : number) {
        const nbOfTodosBeforeDelete =  this.todos.length;

        this.todos = [...this.todos.filter(t => t.id !== id)]
        if (this.todos.length < nbOfTodosBeforeDelete)
            return {deleted : 1, nbTodos : this.todos.length}
        else
        {
            return {deleted : 0, nbTodos : this.todos.length}
        }
    }
}
