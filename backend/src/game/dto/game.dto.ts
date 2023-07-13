import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsPositive, isNotEmpty, IsString } from "class-validator";
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
	@IsString()
	color : string

	@IsNotEmpty()
	@IsString()
	difficulty : string
}

//Todo : faire une validation du userId ? en mode est ce qu'il est dans la database
export class UserIdDtto {

	@IsNotEmpty()
	gameId : number

	@IsNotEmpty()
	@IsString()
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

export class SpectateDto {

	@IsNotEmpty()
	gameId : number
}
