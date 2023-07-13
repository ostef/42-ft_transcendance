import { IsNotEmpty, IsPositive, isNotEmpty } from "class-validator";
import type { SpectateGame } from "@/types/games.types";

export class OncConnectionDto {
	id : string
}

export class GameSpectateDto {
	
	games : SpectateGame[]
}