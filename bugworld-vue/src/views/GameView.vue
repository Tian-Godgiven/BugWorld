<template>
  <div id="top_area">
    <div id="tile_container">
      <LogTile />
      <BugNestTile />
      <BugGroupTile />
      <WorkTile />
      <FacilityTile />
      <EventTile />
    </div>
  </div>
  <div id="bottom_area">
    <div id="cube_container"></div>
    <div id="next_turn" @click="nextTurn">下一回合</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import LogTile from '../components/tiles/LogTile.vue'
import BugNestTile from '../components/tiles/BugNestTile.vue'
import BugGroupTile from '../components/tiles/BugGroupTile.vue'
import WorkTile from '../components/tiles/WorkTile.vue'
import FacilityTile from '../components/tiles/FacilityTile.vue'
import EventTile from '../components/tiles/EventTile.vue'
import { useGameStore } from '../stores/game'
import { startGame } from '../utils/gameStart'

const gameStore = useGameStore()

onMounted(() => {
  // 初始化游戏
  startGame()
})

function nextTurn() {
  gameStore.nextTurn()
}
</script>

<style scoped>
/* 移除自定义样式，使用 main.css 中的原始样式 */
</style>
