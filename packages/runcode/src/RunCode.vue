<!-- 运行组件模型 -->
<template>
  <div class="vitepress-plugin-runcode">
    <div class="vitepress-plugin-runcode--output" v-html="current.message" />

    <div class="vitepress-plugin-runcode--operate">
      <div class="vitepress-plugin-runcode--operate-left">
        <div class="vitepress-plugin-runcode--operate-button" @click="toggleCode">
          <img :src="IconCode">
          <span class="vitepress-plugin-runcode--operate-tooltip">查看源代码</span>
        </div>
        <div class="vitepress-plugin-runcode--operate-button" @click="handleCopy">
          <img :src="IconCopy">
          <span
            class="vitepress-plugin-runcode--operate-tooltip"
            :style="{
              color: copyTip === '已复制' ? '#42b883' : '#ffffff',
              background: copyTip === '已复制' ? '#ffffff' : '#303133',
            }"
          >{{ copyTip }}</span>
        </div>
      </div>

      <div class="vitepress-plugin-runcode--operate-center" @click="handleGoTools">
        感谢菜鸟工具
      </div>

      <div class="vitepress-plugin-runcode--operate-right">
        <div class="vitepress-plugin-runcode--operate-button" @click="current.disabled ? () => {} : handleRun()">
          <img :src="IconRun">
          <span class="vitepress-plugin-runcode--operate-tooltip">开始执行</span>
        </div>
        <div class="vitepress-plugin-runcode--operate-button" @click="handleSet">
          <img :src="IconSet">
          <span class="vitepress-plugin-runcode--operate-tooltip">重置代码</span>
        </div>
      </div>
    </div>

    <div
      ref="refSourceCode"
      class="vitepress-plugin-runcode--source vitepress-plugin-runcode--source-transition"
      :class="{ 'vitepress-plugin-runcode--source-editable': props.editable }"
      :style="{ 'max-height': codeHeight }"
      :contentEditable="props.editable"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useClipboard, useFetch } from '@vueuse/core'
import { removeHtmlTag, throwError } from './utils'
import IconRun from './icons/run.svg'
import IconSet from './icons/set.svg'
import IconCode from './icons/code.svg'
import IconCopy from './icons/copy.svg'

interface IProps {
  /**
   * 是否可编辑
   * default true
   */
  editable?: boolean

  /**
   * 是否初始执行
   * default true
   */
  initable?: boolean

  /**
   * 是否收起
   * default true
   */
  collapsable?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  editable: true,
  initable: true,
  collapsable: true,
})

enum Language {
  'ts' = '1001',
}
type LanguageName = keyof typeof Language
type LanguageCode = `${Language}`
interface ICurrent {
  disabled: boolean
  message: string
  languageName: LanguageName
  languageCode: LanguageCode
}

const current = reactive<ICurrent>({
  disabled: false,
  message: '[等待执行]：暂无执行结果',
  languageName: 'ts',
  languageCode: '1001',
})

const refSourceCode = ref<HTMLElement>()

onMounted(() => {
  // 初始执行
  props.initable && handleRun()
})

/**
 * 运行代码
 */
const handleRun = () => {
  current.disabled = true
  current.message = '[等待结果]：执行中...'
  const sourceCode = getSourceCode()
  // 这里使用的是菜鸟工具的在线运行
  // https://c.runoob.com/compile
  const cnData = {
    url: 'https://tool.runoob.com/compile2.php',
    form: `token=b6365362a90ac2ac7098ba52c13e352b&fileext=${current.languageName}&language=${current.languageCode}&code=${sourceCode}`,
  }
  // node层只是包装了返回值解决跨域问题
  // https://nginx.vtrbo.cn
  useFetch('https://nginx.vtrbo.cn/vitepress-plugins/runcode').post(cnData).json().then((res) => {
    if (res.data.value.error) {
      current.message = '[运行错误]：请检查欲运行的代码是否存在错误'
      current.disabled = false
      throwError('欲运行的代码错误 (Runtime Code Error).')
    }
    current.message = res.data.value.output || '[未获取结果]：请重新点击运行以获取结果'
    current.disabled = false
  })
}

/**
 * 获取欲执行的源码
 */
const getSourceCode = () => {
  const htmlTags = refSourceCode.value!.getElementsByTagName('pre')
  if ((htmlTags || []).length < 1) {
    current.message = '[初始化错误]：未能成功加载欲运行的代码'
    throwError('未找到承载源代码的元素 (Code Dom Not Found).')
  }
  let sourceCode = htmlTags[0].innerHTML
  sourceCode = removeHtmlTag(sourceCode)
  return sourceCode
}

// 运行语言
onMounted(() => {
  getCodeLanguage()
})

/**
 * 获取欲执行的语言
 */
const getCodeLanguage = () => {
  let language = refSourceCode.value!.querySelector('div[class*=language]')!.className
  if (!language) {
    current.message = '[初始化错误]：未能成功加载欲运行的代码'
    throwError('未找到承载源代码的元素 (Code Dom Not Found).')
  }
  language = language.replace('language-', '').replace(' line-numbers-mode', '')
  language = ['js', 'ts', 'javaScript', 'typeScript'].map(m => m.toLowerCase()).includes(language.toLowerCase()) ? 'ts' : language
  current.languageName = language as LanguageName
  current.languageCode = Language[current.languageName]
}

// 记录最初的代码
let recordCodeHtml = ''
onMounted(() => {
  recordCodeHtml = refSourceCode.value!.innerHTML
})

/**
 * 重置代码
 */
const handleSet = () => {
  refSourceCode.value!.innerHTML = recordCodeHtml
}

// 代码框高度
const codeHeight = ref('')
// 记录的高度
let recordHeight = 0
// 收起/展开 true/false
const panelCollapsable = ref(props.collapsable)

onMounted(() => {
  // 获取实际高度
  recordHeight = refSourceCode.value!.clientHeight
  // 计算展示的高度
  computeCodeHeight()
})

watch(
  () => panelCollapsable.value,
  () => {
    computeCodeHeight()
  },
)

/**
 * 展开收起源代码
 */
const toggleCode = () => {
  panelCollapsable.value = !panelCollapsable.value
}

/**
 * 调整代码块高度
 */
const computeCodeHeight = () => {
  if (panelCollapsable.value)
    codeHeight.value = '0px'
  else
    codeHeight.value = `${recordHeight + 2}px`
}

// 复制提示
const copyTip = ref('复制代码')

/**
 * 复制代码
 */
const handleCopy = () => {
  const { copy } = useClipboard()
  copy(getSourceCode())
  copyTip.value = '已复制'
  setTimeout(() => {
    copyTip.value = '复制代码'
  }, 2000)
}

/**
 * 跳转到在线工具
 */
const handleGoTools = () => {
  window.open('https://c.runoob.com/compile/')
}
</script>

<style lang="scss">
.vp-doc div[class*='language-'] {
  border-radius: 0;
  margin: 0;
  position: static;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;

  .copy {
    display: none;
  }

  .shiki {
    padding: 15px;

    code {
      padding: 0;
    }
  }
}
</style>

<style lang="scss" scoped>
.vitepress-plugin-runcode {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  .vitepress-plugin-runcode--output {
    padding: 15px;
    border-bottom: 1px solid #dcdfe6;
    font-size: 12px;
    color: #707379;
  }

  .vitepress-plugin-runcode--operate {
    padding: 0 15px;
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .vitepress-plugin-runcode--operate-left {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    .vitepress-plugin-runcode--operate-center {
      font-size: 10px;
      color: #707379;
      cursor: pointer;
    }

    .vitepress-plugin-runcode--operate-right {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .vitepress-plugin-runcode--operate-button {
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

      .vitepress-plugin-runcode--operate-tooltip {
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
        .vitepress-plugin-runcode--operate-tooltip {
          visibility: visible;
        }
      }
    }
  }

  .vitepress-plugin-runcode--source {
    outline: none;
    overflow: hidden;
    background: #292d3e;

    &:hover {
      overflow: auto;
    }
  }

  .vitepress-plugin-runcode--source-transition {
    transition: max-height 0.25s;

    &:hover {
      max-height: auto;
    }
  }
}

.vitepress-plugin-runcode--source::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.vitepress-plugin-runcode--source::-webkit-scrollbar-track-piece {
  background-color: #292d3e;
  border-radius: 4px;
}

.vitepress-plugin-runcode--source::-webkit-scrollbar-track {
  background-color: #292d3e;
  border-radius: 4px;
}

.vitepress-plugin-runcode--source::-webkit-scrollbar-thumb {
  background-color: #d4d8e2;
  border-radius: 4px;
}

.vitepress-plugin-runcode--source::-webkit-scrollbar-button {
  background-color: #292d3e;
  border-radius: 4px;
}
</style>
