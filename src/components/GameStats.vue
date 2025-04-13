<template>
    <div class="d-flex ga-5 ">
        <span>
            <v-icon size="large" v-tooltip="'Score'">mdi-star</v-icon>
            {{ gameState.score }}
        </span>
        <span>
            <v-icon size="large" v-tooltip="'Level'">mdi-chevron-up</v-icon>
            {{ gameState.level }}
        </span>
        <span>
            <v-icon size="large" color="red" v-tooltip="'Lives'">mdi-heart</v-icon>
            {{ gameState.lives }}
        </span>
        <span>
            <v-icon size="large" v-tooltip="'Gold'">mdi-gold</v-icon>
            {{ gameState.gold }}
        </span>
    </div>
</template>

<script setup lang="ts">
import type { GameState } from '@/types/game';

defineProps<{
    gameState: GameState;
}>();
</script>