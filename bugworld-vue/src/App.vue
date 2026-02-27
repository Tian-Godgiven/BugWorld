<script setup lang="ts">
import GameView from './views/GameView.vue'
import './assets/css/main.scss'
import './assets/css/tile.scss'
import './assets/css/objectDiv.css'
import './assets/css/log.css'
import './assets/css/Tiles/bugGroup.css'
import './assets/css/Tiles/chooseTile.css'
import './assets/css/Tiles/eventTile.css'
import './assets/css/Tiles/facility.css'
import './assets/css/Tiles/orderTile.css'
import './assets/css/Tiles/workTile.css'
import './assets/css/modules/screen.css'
import './assets/css/modules/tile/cube.css'
import './assets/css/modules/tile/tileButton.css'
</script>

<template>
  <div id="main">
    <GameView />
  </div>
</template>

<style>
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
