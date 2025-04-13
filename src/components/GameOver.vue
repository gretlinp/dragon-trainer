<template>
    <div class="d-flex align-center justify-center flex-column text-grey-lighten-3">
        <v-img :src="dragonTrainer" width="400" height="400" />
        <span v-if="playForeverRef" class="text-center text-grey-lighten-2 text-h4">
            You did pretty well, {{ trainerName }}. <br>
            Even the toughest dragons get tired.
        </span>
        <span v-else class="text-center text-grey-lighten-2 text-h4">
            Today is not your day, {{ trainerName }}. <br>
            Try again tomorrow.
        </span>
    </div>
</template>

<script setup lang="ts">
import { toRef, watch } from 'vue'
import dragonTrainer from '@/assets/dragon_trainer.png'

const props = defineProps<{
    trainerName: string;
    playForever: boolean;
}>();

const playForeverRef = toRef(props, 'playForever')

watch(playForeverRef, (newValue) => {
    console.log('The mighty dragon tamer will continue!')
})
</script>