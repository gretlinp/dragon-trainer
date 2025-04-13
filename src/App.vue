<template>
  <v-app>
    <v-responsive>
      <v-app-bar elevation="0" class="pr-5 pl-5" :color="gameState?.lives <= 1 ? 'red-darken-4' : 'green'">
        <v-toolbar-title>
          <span v-if="gameState?.lives <= 1" class="text-body-1">Fail one more mission and you're out!</span>
          <span v-else-if="gameState && trainerName && isAdBoardVisible" class="text-green-darken-4">
            Get to work, {{ trainerName }}
          </span>
          <span v-else class="text-green-darken-4">Dragon trainer job board</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <GameStats v-if="gameState && !isLoading" :game-state="gameState" />
      </v-app-bar>

      <v-main class="fill-height" :class="gameState?.lives <= 1 ? 'bg-red-darken-3' : 'bg-green-lighten-5'">
        <v-container class="d-flex flex-column ga-3">
          <v-row>
            <v-col cols="12">
              <span v-if="!gameState && !isGameOver && !isGameWon" class="d-flex flex-column justify-center">
                <span class=" text-center pa-4 gap-2 d-flex flex-column">
                  <div class="text-h6 pa-4">Welcome!</div>
                  <div class="text-body-1 pa-4">
                    If you are a freelance dragon trainer seeking glory, you have come to the right place.
                    Complete missions and become a true Dragon Tamer known in all the kingdoms. Having a dragon does
                    not guarantee your success, this is after all a free market! You must also act with thought - so
                    choose your battles wisely.
                  </div>
                  <div class="text-caption">
                    Win the game by collecting at least 1000 points. You collect
                    points by
                    solving missions. Buy items from the shop to
                    increase your
                    chances of success.
                  </div>
                  <div class="text-body-1 font-weight-bold pa-2">
                    If you run out of lives, you loose the game.
                  </div>
                </span>
                <v-btn block @click="startGame" class="hover border" color="green-darken-1" elevation="0">
                  <span v-if="!isLoading">Start the day</span>
                  <v-img v-if="isLoading" :src="dragon" width="30" height="30" class="loading-rotate loading" />
                </v-btn>
              </span>

              <v-col v-if="!isLoading && gameState && !isAdBoardVisible && !isGameWon"
                class="d-flex flex-column justify-center">
                <span class="text-body-1 text-center">You must be pretty brave to take on these tasks! To continue you
                  must sign your
                  name.</span>
                <span class="d-flex justify-center">
                  <v-col cols="6">
                    <v-text-field v-model="trainerName" variant="underlined" append-inner-icon="mdi-fountain-pen-tip"
                      color="grey-lighten-1" @keyup.enter="submitName" hide-details @click:append-inner="submitName" />
                  </v-col>

                </span>
              </v-col>
            </v-col>
          </v-row>

          <v-btn flat color="green-lighten-3 hover" v-if="isAdBoardVisible" @click="fetchMessages">Find more
            missions</v-btn>

          <v-row>
            <v-col cols="12" v-if="!isLoading && isAdBoardVisible">
              <AdBoard v-if="isAdBoardVisible" :ads="ads" :gameId="gameState?.gameId" :gameState="gameState"
                @update-game-state="updateGameState" @game-over="handleGameOver" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" v-if="!isLoading && isShopVisible && trainerName && gameState.gold > 0">
              <Shop v-if="isShopVisible" :shopItems="shopItems" :gameId="gameState.gameId" :gold="gameState.gold"
                :score="gameState.score" :level="gameState.level" @game-over="handleGameOver"
                @update-game-state="updateGameState" />

            </v-col>
          </v-row>

          <v-row v-if="gameState && isAdBoardVisible && isShopVisible" class="little-helper-text pa-2">
            <v-divider></v-divider>

            <v-col cols="12">
              <span class="text-center pa-4 ">
                <div class="d-flex flex-column justify-center">
                  Win the game by collecting at least 1000 points. You collect
                  points by solving missions. You can skip missions if they seem too risky or the
                  reward is too low.
                </div>
                <div>You do not need to try to solve all missions. You have to try to solve only one mission per page
                  before you can click to see more missions.</div>
                <div>If you run out of lives, you loose the game.</div>
                <div>
                  Each mission has a different probability of success. The more items you buy, the higher your
                  probability
                  of success becomes.
                </div>
              </span>
            </v-col>
          </v-row>
        </v-container>
      </v-main>

      <!-- Game over -->
      <v-overlay v-model="isGameOver" opacity="0.6" class="align-center justify-center">
        <GameOver :trainer-name="trainerName" :play-forever="playForever" />
      </v-overlay>

      <!-- Game won -->
      <v-overlay v-model="isGameWon" opacity="0.8" class="align-center justify-center">
        <Win :trainer-name="trainerName" @continue="continueGame" />
      </v-overlay>
    </v-responsive>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdBoard from "@/components/AdBoard.vue";
import Shop from "@/components/Shop.vue";
import GameStats from "@/components/GameStats.vue";
import Win from "@/components/Win.vue";
import GameOver from "@/components/GameOver.vue";
import type { GameState, Ad, ShopItem, MissionResult } from '@/types/game';
import dragon from '/dragon.png';

const gameState = ref<GameState | null>(null);
const ads = ref<Ad[]>([]);
const shopItems = ref<ShopItem[]>([]);
const isLoading = ref(false);
const trainerName = ref('');
const isGameOver = ref(false);
const isGameWon = ref(false);
const isAdBoardVisible = ref(false);
const isShopVisible = ref(false);
const playForever = ref(false);


const startGame = async () => {
  try {
    isGameOver.value = false;
    isLoading.value = true;
    const response = await fetch('https://dragonsofmugloar.com/api/v2/game/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error("It's better you take a day off today...");
    }


    gameState.value = await response.json();
    isLoading.value = false;

    await Promise.all([fetchMessages(), fetchShopItems()]);
  } catch (error) {
    console.error('Error starting game:', error);
    isLoading.value = false;
  }
}

const fetchMessages = async () => {
  if (!gameState.value?.gameId) return;

  try {
    const response = await fetch(`https://dragonsofmugloar.com/api/v2/${gameState.value.gameId}/messages`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch messages');

    ads.value = await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
}

const fetchShopItems = async () => {
  if (!gameState.value?.gameId) return;

  try {
    const response = await fetch(`https://dragonsofmugloar.com/api/v2/${gameState.value.gameId}/shop`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch shop items');

    if (response.status === 410) {
      handleGameOver();
      return;
    }

    shopItems.value = await response.json();
    isShopVisible.value = true;

  } catch (error) {
    console.error('Error fetching shop items:', error);
  }
}

const submitName = () => {
  if (trainerName.value.trim()) {
    isAdBoardVisible.value = true;
  }
}

const updateGameState = (result: MissionResult) => {
  if (gameState.value) {
    gameState.value.lives = result.lives;
    gameState.value.gold = result.gold;
    if ('score' in result) gameState.value.score = result.score;
    gameState.value.highScore = result.highScore;
    gameState.value.turn = result.turn;
    if ('level' in result) gameState.value.level = result.level;
  }
  if (result.lives === 0) {
    handleGameOver();
  }

  if (gameState.value.score >= 1000) {
    handleWin();
  };
}

const handleGameOver = () => {
  isGameOver.value = true;
  gameState.value = null;
  isAdBoardVisible.value = false;
  isShopVisible.value = false;
};

const handleWin = () => {
  if (playForever.value) return;
  isGameWon.value = true;
  isAdBoardVisible.value = false;
  isShopVisible.value = false;
};

const continueGame = () => {
  isGameWon.value = false;
  playForever.value = true;
  isAdBoardVisible.value = true;
  isShopVisible.value = true;
}



</script>
