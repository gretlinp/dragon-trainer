<template>
    <v-row>
        <v-col v-for="ad in filteredAds" :key="ad.adId" cols="12" sm="6" md="4">
            <v-card class="h-100 w-100 position-relative d-flex">
                <div class="d-flex flex-column flex-grow-1">
                    <v-card-text class="d-flex flex-column">
                        <div class="text-body-1 font-weight-medium text-center pa-2">{{ ad.message }}</div>
                        <div class="text-body-2 text-center font-weight-bold">Reward: {{ ad.reward }}
                            &nbsp;<v-icon size="x-small">mdi-gold</v-icon>
                        </div>
                        <div class="text-body-2 text-center font-weight-bold">Probability: {{ ad.probability }}</div>
                    </v-card-text>

                    <v-card-actions class="d-flex justify-center mt-auto pb-4">
                        <v-btn v-if="ad.probability == 'Suicide mission'" color="red-darken-3"
                            @click="solveMission(ad.adId)" :disabled="gameState.lives <= 1">
                            Accept with caution
                        </v-btn>
                        <v-btn v-else-if="ad.probability == 'Gamble'" color="purple-darken-3"
                            @click="solveMission(ad.adId)">
                            Roll the dice
                        </v-btn>
                        <v-btn v-else-if="ad.probability == 'Impossible'" @click="solveMission(ad.adId)">
                            I am the Storm
                        </v-btn>
                        <v-btn v-else @click="solveMission(ad.adId)" color="green-darken-3">
                            Accept mission
                        </v-btn>
                    </v-card-actions>
                </div>

                <v-overlay :model-value="loading === ad.adId || !!missionResults[ad.adId]"
                    class="align-center justify-center" opacity="0.9" contained absolute
                    :scrim="loading === ad.adId ? 'black' : (missionResults[ad.adId]?.success ? 'green-darken-1' : 'red-darken-3')">
                    <span class="d-flex justify-center align-center">
                        <v-img v-if="loading === ad.adId" :src="dragonWhite" width="48" height="48"
                            class="loading-rotate" />

                        <span v-else-if="missionResults[ad.adId]" class="text-uppercase pa-2 text-center"
                            :class="missionResults[ad.adId].success ? 'text-green-darken-4 font-weight-bold' : 'text-black font-weight-bold'">
                            {{ missionResults[ad.adId].message }}
                        </span>
                    </span>
                </v-overlay>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Ad, MissionResult, GameState } from '@/types/game';
import dragon from '/dragon.png';
import dragonWhite from '/dragon_white.png';

const props = defineProps<{
    ads: Ad[];
    gameId: string;
    gameState: GameState;
}>();

const emit = defineEmits<{
    (e: 'update-game-state', result: MissionResult): void;
    (e: 'game-over'): void;
}>();

const loading = ref('');
const missionResults = ref<Record<string, MissionResult>>({});

const filteredAds = computed(() => {
    return props.ads.filter(ad => !ad.encrypted);
});

const solveMission = async (adId: string) => {
    loading.value = adId;
    try {
        const response = await fetch(`https://dragonsofmugloar.com/api/v2/${props.gameId}/solve/${adId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.status === 410) {
            missionResults.value[adId] = {
                success: false,
                message: 'Game Over',
                gold: props.gameState.gold,
                lives: 0,
                turn: props.gameState.turn,
                level: props.gameState.level,
                score: props.gameState.score
            };
            emit('update-game-state', missionResults.value[adId]);
            emit('game-over');
            return;
        }


        if (response.status === 400) {
            missionResults.value[adId] = {
                unavailable: true,
                success: false,
                message: 'Mission unavailable, try something else.',
                gold: props.gameState.gold,
                lives: props.gameState.lives,
                score: props.gameState.score,
                turn: props.gameState.turn || 0
            };
            return;
        }

        const result = await response.json();
        missionResults.value[adId] = result;
        loading.value = '';
        emit('update-game-state', {
            ...result,
            level: props.gameState.level
        });

    } catch (error) {
        console.error('Error solving mission:', error);
    } finally {
        loading.value = '';
    }
};
</script>

<style scoped>
.loading-rotate {
    animation: rotate 2s infinite linear;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.position-absolute {
    position: absolute;
}

.faulty-message {
    min-height: 200px;

}
</style>