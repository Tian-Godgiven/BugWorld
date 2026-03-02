<template>
    <Teleport to="body">
        <div v-if="isVisible" class="black-screen" @click.stop></div>
    </Teleport>
</template>

<script setup lang="ts">
import { useBlackScreen } from '../../composables/useBlackScreen'

const { isVisible } = useBlackScreen()
</script>

<style scoped>
.black-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    cursor: default;
}
</style>
