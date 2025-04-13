<template>
    <div class="d-flex align-center justify-center flex-column pulse">
        <v-img :src="dragonTrainerWin" width="300" height="300" />
        <span class="text-center text-light-green-accent-4 text-h4 pa-4">
            You did it, {{ trainerName }}! <br>
            You are a true dragon tamer!
        </span>

        <v-btn block @click="$emit('continue')" color="green-darken-1" elevation="0">
            If you wish to seek eternal glory, you can continue playing.
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import dragonTrainerWin from '@/assets/dragon_trainer_color.png'

defineProps<{
    trainerName: string;
}>();

defineEmits<{
    (e: 'continue'): void;
}>();
</script>