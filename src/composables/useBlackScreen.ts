import { ref } from 'vue'

/**
 * 黑屏遮罩 Composable
 *
 * 用于管理全局黑屏遮罩的显示/隐藏状态
 */

const isVisible = ref(false)

export function useBlackScreen() {
    /**
     * 显示黑屏遮罩
     */
    function show() {
        isVisible.value = true
    }

    /**
     * 隐藏黑屏遮罩
     */
    function hide() {
        isVisible.value = false
    }

    return {
        isVisible,
        show,
        hide
    }
}
