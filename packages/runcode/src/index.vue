<!-- 运行组件模型 -->
<template>
  <div class="VppRuncode">
    <div class="VppOutput">
      <div v-if="!output.loading" class="VppOutputCard" v-html="output.result" />
      <div v-else class="VppOutputLoading">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>

    <div class="VppOperate">
      <div class="VppOperateLeft">
        <div class="VppOperateButton" @click="handleToggle">
          <img :src="IconCode">
          <span class="VppOperateTooltip">查看源代码</span>
        </div>
        <div class="VppOperateButton" @click="handleCopy">
          <img :src="IconCopy">
          <span
            class="VppOperateTooltip"
            :style="{
              color: tooltip === '已复制' ? '#42b883' : '#ffffff',
              background: tooltip === '已复制' ? '#ffffff' : '#303133',
            }"
          >{{ tooltip }}</span>
        </div>
      </div>

      <div class="VppOperateCenter" />

      <div class="VppOperateRight">
        <div class="VppOperateButton" @click="output.loading ? () => {} : handleRun()">
          <img :src="IconRun">
          <span class="VppOperateTooltip">开始执行</span>
        </div>
        <div class="VppOperateButton" @click="handleSet">
          <img :src="IconSet">
          <span class="VppOperateTooltip">重置代码</span>
        </div>
      </div>
    </div>

    <div ref="refMirror" class="VppMirror">
      <div :style="{ height: collapsable ? '0px' : mirror.height }">
        <Codemirror
          v-model="mirror.code"
          :extensions="mirror.theme"
          :indent-with-tab="true"
          :tab-size="2"
          :disabled="!props.editable"
        />
      </div>
    </div>

    <!-- 源码 页面不可见 -->
    <div ref="refCode" class="VppSource">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { useClipboard } from '@vueuse/core'
import { removeHtmlTag, throwError } from './utils'
import { tsExecutor } from './executor/tsExec'
import IconRun from './icons/run.svg'
import IconSet from './icons/set.svg'
import IconCode from './icons/code.svg'
import IconCopy from './icons/copy.svg'

type Language = 'js' | 'ts'

interface RunCodeProps {
  /**
   * 代码运行语言
   *
   * default 'js'
   */
  language: Language

  /**
   * 唯一标识
   *
   * default 唯一随机8位字符
   */
  symbolize?: string

  /**
   * 是否初始执行
   * true执行 false不执行
   *
   * default true
   */
  initable?: boolean

  /**
   * 是否可编辑
   * true可编辑 false不可编辑
   *
   * default true
   */
  editable?: boolean

  /**
   * 是否收起代码
   * true收起 false展开
   *
   * default true
   */
  collapsable?: boolean

  /**
   * 依赖项代码
   *
   * default ''
   */
  dependency?: string
}

const props = withDefaults(
  defineProps<RunCodeProps>(),
  {
    language: 'js',
    symbolize: '',
    initable: true,
    editable: true,
    collapsable: true,
    dependency: '',
  },
)

/**
 * 承载代码元素
 * 仅获取运行代码
 * 页面不可见
 */
const refCode = ref<HTMLElement>()

/**
 * 代码编辑元素
 */
const refMirror = ref<HTMLElement>()

/**
 * 是否收起代码
 */
const collapsable = ref<boolean>(props.collapsable)

/**
 * 编辑区主题
 */
const themeMap: Record<Language, any> = {
  js: javascript,
  ts: javascript,
}

/**
 * 编辑区数据
 */
const mirror = ref<{
  // 代码
  code: string
  // 高度
  height: string
  // 主题
  theme: any[]
}>({
  code: '',
  height: '0px',
  theme: [javascript(), oneDark],
})

/**
 * 执行器数据
 */
const exectorMap: Record<Language, any> = {
  js: tsExecutor,
  ts: tsExecutor,
}

/**
 * 输出数据
 */
const output = reactive<{
  // 加载状态
  loading: boolean
  // 运行结果
  result: string
}>({
  loading: false,
  result: '[等待执行]：目前没有任何执行结果',
})

/**
 * 记录数据
 */
const record = reactive<{
  // 代码
  code: string
  // 高度
  height: number
}>({
  code: '',
  height: 0,
})

onMounted(() => {
  // 记录代码
  record.code = getCode()
  // 设置代码
  mirror.value.code = record.code

  nextTick(() => {
    // 记录高度
    record.height = getHeight()
    // 计算高度
    computeHeight()
  })

  // 设置主题
  mirror.value.theme = [themeMap[props.language](), oneDark]

  // 初始自动执行
  props.initable && handleRun()
})

watch(
  () => collapsable.value,
  () => {
    computeHeight()
  },
)

/**
 * 获取代码
 */
const getCode = () => {
  const tags = refCode.value!.getElementsByTagName('pre')
  if ((tags || []).length) {
    // 抛出无元素错误
    output.result = '[加载错误]：未找到承载代码的元素'
    output.loading = false
    throwError(output.result)
    return ''
  }
  if ((tags || []).length !== 1) {
    // 抛出元素过多错误
    output.result = '[加载错误]：承载代码的元素过多'
    output.loading = false
    throwError(output.result)
    return ''
  }
  return removeHtmlTag(tags[0].innerHTML, true)
}

/**
 * 获取高度
 */
const getHeight = () => {
  const tags = refMirror.value!.getElementsByClassName('cm-editor')
  if ((tags || []).length) {
    // 抛出无元素错误
    output.result = '[加载错误]：未找到承载代码的元素'
    output.loading = false
    throwError(output.result)
    return 0
  }
  if ((tags || []).length !== 1) {
    // 抛出元素过多错误
    output.result = '[加载错误]：承载代码的元素过多'
    output.loading = false
    throwError(output.result)
    return 0
  }
  return tags[0].clientHeight
}

/**
 * 计算高度
 */
const computeHeight = () => {
  if (collapsable.value)
    mirror.value.height = '0px'
  else
    mirror.value.height = `${record.height + 5}px`
}

/**
 * 展开收起源代码
 */
const handleToggle = () => {
  collapsable.value = !collapsable.value
}

/**
 * 复制代码
 */
const tooltip = ref('复制代码')
const handleCopy = () => {
  if (tooltip.value === '已复制')
    return
  const { copy } = useClipboard()
  copy(getCode())
  tooltip.value = '已复制'
  setTimeout(() => {
    tooltip.value = '复制代码'
  }, 1500)
}

/**
 * 运行代码
 */
const handleRun = () => {
  if (output.loading)
    return

  output.loading = true
  const wholeCode = `${props.dependency}\n${mirror.value.code}`
  const res = exectorMap[props.language](wholeCode)
  if (res.status === 'error') {
    output.result = '[运行错误]：请检查代码是否错误'
    output.loading = false
    return throwError(output.result)
  }
  output.result = `${res.output}`
  output.loading = false
}

/**
 * 重置代码
 */
const handleSet = () => {
  mirror.value.code = record.code
}
</script>

<style lang="scss" scoped>
// 圆角大小
$radius: 4px;

.VppRuncode {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: $radius;

  .VppOutput {
    padding: 15px;
    border-bottom: 1px solid #dcdfe6;
    font-size: 12px;
    color: #707379;

    .VppOutputCard {
      white-space: pre-wrap;
    }

    .VppOutputLoading {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0px;
      padding: 0px;
    }

    .VppOutputLoading > span {
      vertical-align: middle;
      border-radius: 100%;
      display: inline-block;
      width: 10px;
      height: 10px;
      margin: 3px 2px;
      animation: loading 0.8s linear infinite alternate;
    }

    .VppOutputLoading > span:nth-child(1) {
      animation-delay: -1s;
      background: rgba(112, 115, 121, 0.6);
    }

    .VppOutputLoading > span:nth-child(2) {
      animation-delay: -0.8s;
      background: rgba(112, 115, 121, 0.8);
    }

    .VppOutputLoading > span:nth-child(3) {
      animation-delay: -0.26666s;
      background: rgba(112, 115, 121, 1);
    }

    .VppOutputLoading > span:nth-child(4) {
      animation-delay: -0.8s;
      background: rgba(112, 115, 121, 0.8);
    }

    .VppOutputLoading > span:nth-child(5) {
      animation-delay: -1s;
      background: rgba(112, 115, 121, 0.4);
    }

    @keyframes loading {
      from {
        transform: scale(0, 0);
      }

      to {
        transform: scale(1, 1);
      }
    }
  }

  .VppOperate {
    padding: 0 15px;
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .VppOperateLeft {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    .VppOperateCenter {
      font-size: 10px;
      color: #707379;
      cursor: pointer;
    }

    .VppOperateRight {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .VppOperateButton {
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      user-select: none;
      position: relative;

      &:not(:first-child) {
        margin-left: 10px;
      }

      img {
        width: 18px;
        height: 18px;
      }

      .VppOperateTooltip {
        visibility: hidden;
        position: absolute;
        z-index: 2;
        top: 40px;
        color: #ffffff;
        background: #303133;
        border: 1px solid #dcdfe6;
        padding: 0 10px;
        height: 32px;
        font-size: 10px;
        line-height: 100%;
        border-radius: 4px;
        white-space: nowrap;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      &:hover {
        .VppOperateTooltip {
          visibility: visible;
        }
      }
    }
  }

  .VppMirror {
    background: #282c34;
    border-bottom-left-radius: $radius;
    border-bottom-right-radius: $radius;
    overflow: hidden;

    & > div {
      outline: none;
      overflow: scroll;
      transition: all 0.25s;
    }

    :deep(.cm-editor) {
      padding: 15px 15px 5px !important;
      font-size: 14px;

      .cm-gutters {
        display: none;
      }
    }
  }

  .VppSource {
    display: none;
  }
}

.VppMirror > div::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.VppMirror > div::-webkit-scrollbar-button {
  background-color: #292d3e;
  border-radius: $radius;
}

.VppMirror > div::-webkit-scrollbar-track {
  background-color: #292d3e;
}

.VppMirror > div::-webkit-scrollbar-track-piece {
  background-color: #292d3e;
}

.VppMirror > div::-webkit-scrollbar-thumb {
  background-color: #d4d8e2;
  border-radius: $radius;
}

.VppMirror > div::-webkit-scrollbar-corner {
  background-color: #292d3e;
}
</style>
