import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsPositive, isNotEmpty } from "class-validator";
import { SpectateGame } from "../types/game.types";

//Todo : Faire une validation plus propre ? Genre si la mouseheight est négative etc
export class UpdatePaddleDto {

	@IsNotEmpty()
	gameId : number

	@IsNotEmpty()
	paddlePos : number
}

export class ConfigurateDto {

	@IsNotEmpty()
	gameId : number

	@IsNotEmpty()
	color : string

	@IsNotEmpty()
	difficulty : string
}

//Todo : faire une validation du userId ? en mode est ce qu'il est dans la database
export class UserIdDtto {

	@IsNotEmpty()
	gameId : number

	@IsNotEmpty()
	userId : string
}

export class StartInviteDto {

	@IsNotEmpty()
	gameId : number
}

export class JoinInviteDto {
	
	@IsNotEmpty()
	gameId : number

}

export class GameSpectateDto {
	
	games : SpectateGame[]
}
