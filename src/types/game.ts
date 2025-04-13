export interface Ad {
	adId: string;
	message: string;
	reward: number;
	expiresIn?: number;
	probability: string;
}

export interface MissionResponse {
	success: boolean;
	lives: number;
	gold: number;
	score: number;
	highScore: number;
	turn: number;
	message: string;
}

export interface ShopItem {
	id: string;
	name: string;
	cost: number;
}

export interface PurchaseResult {
	success: boolean;
	gold: number;
	lives: number;
	level: number;
	turn: number;
	score: number;
}

export type ShopItemId =
	| "hpot"
	| "cs"
	| "gas"
	| "wax"
	| "tricks"
	| "wingpot"
	| "ch"
	| "rf"
	| "iron"
	| "mtrix"
	| "wingpotmax";

export interface GameState {
	level: number;
	lives: number;
	gold: number;
	score: number;
	highScore?: number;
	turn?: number;
}

export interface MissionResult {
	success: boolean;
	message: string;
	gold: number;
	lives: number;
	turn: number;
	unavailable?: boolean;
}
