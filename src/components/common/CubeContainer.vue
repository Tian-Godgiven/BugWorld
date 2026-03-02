<template>
    <div id="cube_container">
        <div
            v-for="cube in cubes"
            :key="cube.id"
            class="cube"
            @click="handleCubeClick(cube)"
        >
            {{ cube.name }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/**
 * Cube容器组件
 *
 * 从 src/css/modules/tile/cube.css 迁移
 *
 * 功能：
 * 1. 显示最小化的Tile图标（Cube）
 * 2. 点击Cube可以恢复对应的Tile
 * 3. Tile关闭时可以创建对应的Cube
 */

interface Cube {
    id: string
    name: string
    tileRef?: any
}

const cubes = ref<Cube[]>([])

// 创建Cube
function createCube(id: string, name: string, tileRef?: any): void {
    // 检查是否已存在
    const existingIndex = cubes.value.findIndex((c) => c.id === id)
    if (existingIndex !== -1) {
        cubes.value.splice(existingIndex, 1)
    }

    cubes.value.push({
        id,
        name,
        tileRef
    })
}

// 删除Cube
function removeCube(id: string): void {
    const index = cubes.value.findIndex((c) => c.id === id)
    if (index !== -1) {
        cubes.value.splice(index, 1)
    }
}

// 点击Cube
function handleCubeClick(cube: Cube): void {
    // 显示对应的Tile
    if (cube.tileRef) {
        cube.tileRef.show()
    }

    // 删除这个Cube
    removeCube(cube.id)
}

// 暴露方法
defineExpose({
    createCube,
    removeCube
})
</script>

<style scoped>
/* 从 src/css/modules/tile/cube.css 迁移 */

#cube_container {
    width: 50%;
    position: absolute;
    bottom: 20px;
    left: 20px;
    display: flex;
    flex-wrap: wrap;
}

.cube {
    width: 60px;
    height: 60px;

    margin-right: 5px;

    border: 2px solid black;
    border-radius: 3px;

    font-size: 25px;
    font-weight: 400;

    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;

    cursor: pointer;
}

.cube:hover {
    background-color: #f0f0f0;
}
</style>
