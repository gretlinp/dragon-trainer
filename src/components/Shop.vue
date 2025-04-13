<template>
    <v-container>
        <v-row>
            <v-divider></v-divider>
            <v-col cols="12" class="d-flex flex-column flex-wrap">
                <v-col class="d-flex flex-column ma-2">
                    <span class="text-h6 pa-2 text-center">Use your <v-icon size="small">mdi-gold</v-icon> to buy items
                        that will help
                        you in your
                        quest.</span>
                    <span class="text-caption text-center">Hint: If you're running out of lives, healing potions are
                        your best
                        friend.</span>
                </v-col>

                <v-row>
                    <span v-for="item in shopItems" :key="item.id" class="position-relative">
                        <v-chip density="comfortable" size="large" @click="buyItem(item.id)" class="ma-1"
                            :disabled="!canAfford(item.cost)">
                            <span class="button text-uppercase">
                                Buy {{ item.name }} for {{ item.cost }} &nbsp;<v-icon size="x-small">mdi-gold</v-icon>
                            </span>
                        </v-chip>

                        <v-overlay :model-value="activeItemId === item.id" opacity="0.3"
                            class="align-center justify-center" color="grey-darken-4" contained absolute>
                            <v-icon size="x-large" :color="purchaseSuccess ? 'success' : 'error'">
                                {{ purchaseSuccess ? 'mdi-check' : 'mdi-close' }}
                            </v-icon>
                        </v-overlay>
                    </span>
                </v-row>
            </v-col>
        </v-row>

    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ShopItem, PurchaseResponse, PurchaseResult } from '@/types/game';

const loading = ref('');
const activeItemId = ref('');
const purchaseSuccess = ref(false);

const props = defineProps<{
    shopItems: ShopItem[];
    gameId: string;
    gold: number;
    level: number;
    score: number;
}>();

const emit = defineEmits<{
    (e: 'update-game-state', result: PurchaseResult): void;
    (e: 'game-over'): void;
}>();

const canAfford = (cost: number) => props.gold >= cost;

const buyItem = async (itemId: string) => {
    if (!props.gameId) return;
    loading.value = itemId;
    activeItemId.value = itemId;

    try {
        const response = await fetch(`https://dragonsofmugloar.com/api/v2/${props.gameId}/shop/buy/${itemId}`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to buy item');
        if (response.status === 410) {
            emit('game-over');
            return;
        }

        const result: PurchaseResponse = await response.json();
        purchaseSuccess.value = result.shoppingSuccess;

        setTimeout(() => {
            activeItemId.value = '';
            purchaseSuccess.value = false;
        }, 2000);

        emit('update-game-state', {
            success: result.shoppingSuccess === 'Success',
            gold: result.gold,
            lives: result.lives,
            level: result.level,
            turn: result.turn,
            score: props.score
        });
    } catch (error) {
        purchaseSuccess.value = false;
        setTimeout(() => {
            activeItemId.value = '';
            purchaseSuccess.value = false;
        }, 2000);
        console.error('Error buying item:', error);
    } finally {
        loading.value = '';
    }
}
</script>

<style scoped>
.position-relative {
    border-radius: 30px;
}
</style>