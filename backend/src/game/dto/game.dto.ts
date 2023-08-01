import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsPositive, isNotEmpty, IsString, IsNumber, IS_ALPHA } from "class-validator";
import { SpectateGame } from "../types/game.types";

// @Todo : Faire une validation plus propre ? Genre si la mouseheight est négative etc
export class UpdatePaddleDto {

	@IsNotEmpty()
	@IsNumber()
	gameId : number

	@IsNotEmpty()
	@IsNumber()
	paddlePos : number
}

export class ConfigurateDto {

	@IsNotEmpty()
	@IsNumber()
	gameId : number

	@IsNotEmpty()
	@IsString()
	color : string

	@IsNotEmpty()
	@IsString()
	difficulty : string

	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	score : number
}

export class UserIdDtto {

	@IsNotEmpty()
	@IsNumber()
	gameId : number

	@IsNotEmpty()
	@IsString()
	userId : string
}

export class StartInviteDto {

	@IsNotEmpty()
	@IsString()
	gameId : string

	@IsNotEmpty()
	@IsString()
	userId : string
}

export class JoinInviteDto {

	@IsNotEmpty()
	@IsString()
	gameId : string

	@IsNotEmpty()
	@IsString()
	userId : string
}

export class GameSpectateDto {
	games : SpectateGame[]
}

export class SpectateDto {

	@IsNotEmpty()
	@IsNumber()
	gameId : number
}

export class SearchCreateGameDto {
	@IsNotEmpty()
	@IsString()
	userId : string
}
