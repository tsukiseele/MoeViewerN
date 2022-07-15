<template lang="pug">
.s-site-editor
  NScrollbar(x-scrollable)
    NForm(ref='formRef', :model='formValue', :rules='rules', :size='size')
      NFormItem(label='名称 - name', path='name')
        NInput(v-model:value='formValue.name', placeholder='规则名称')
      NFormItem(label='UUID - id', path='id')
        NInputNumber(v-model:value='formValue.id', placeholder='规则UUID' :show-button="false")
      NFormItem(label='版本 - version', path='version')
        NInputNumber(v-model:value='formValue.version', placeholder='规则版本')
      NFormItem(label='作者 - author', path='author')
        NInput(v-model:value='formValue.author', placeholder='规则作者')
      NFormItem(label='评级 - rating', path='rating')
        NInput(v-model:value='formValue.rating', placeholder='规则评级')
      NFormItem(label='详情 - detail', path='details')
        NInput(v-model:value='formValue.details', placeholder='规则详情')
      NFormItem(label='类型 - type', path='type')
        NSelect(v-model:value="formValue.type" :options="Object.entries(options.type).map(([value, label]) => ({label, value}))" @keydown.enter.prevent='')
      NFormItem(label='图标 - icon', path='icon')
        NInput(v-model:value='formValue.icon', placeholder='规则图标')
      NFormItem(label='请求头 - headers', path='headers')
        NDynamicInput(v-model:value='formValue.headers', #='{ index, value }' :on-create="onCreate" show-sort-button, style="margin-top: .5rem;")
          div(style='display: flex')
            NFormItem(ignore-path-change, :show-label='false', :path='`formValue.headers[${index}].key`', :rule='dynamicInputRule')
              NInput(v-model:value='formValue.headers[index].key', placeholder='Name', @keydown.enter.prevent='')
            div(style='height: 34px; line-height: 34px; margin: 0 8px') =
            NFormItem(ignore-path-change, :show-label='false', :path='`formValue.headers[${index}].value`', :rule='dynamicInputRule')
              NInput(v-model:value='formValue.headers[index].value', placeholder='Value', @keydown.enter.prevent='')
      NFormItem(label='板块列表 - sections', path='sections')
        NDynamicInput(v-model:value='formValue.sections', #='{ index, value }', :on-create="onCreateSection" , style="margin-top: .5rem;")
          NFormItem.section-name(ignore-path-change, :show-label='false', :path='`formValue.sections[${index}].key`')
            NSelect(v-model:value="formValue.sections[index].key" :options="Object.entries(options.section).map(([value, label]) => ({label, value}))" @keydown.enter.prevent='')
          div.sections
            NFormItem(:show-label='false', :path='`formValue.sections[${index}].value.index`')
              NInput(v-model:value='formValue.sections[index].value.index', placeholder='板块索引')
            NFormItem(v-if="formValue.sections[index].value.name" label='名称', :path='`formValue.sections[${index}].value.name`')
              NInput(v-model:value='formValue.sections[index].value.name', placeholder='板块名称')
            NFormItem(v-if="formValue.sections[index].value.detail" label='描述', :path='`formValue.sections[${index}].value.detail`')
              NInput(v-model:value='formValue.sections[index].value.detail', placeholder='板块描述')
            DynamicRulesEditor(v-model:data="formValue.sections[index].value.rules")
      NFormItem
        NButton(attr-type='button', @click='handleValidateClick') 验证
        NButton(attr-type='button', @click='onGenerate') 生成
    pre {{ JSON.stringify(formValue, null, 2) }}
</template>

<script lang="ts">
import { defineComponent, ref, defineProps, PropType } from 'vue'
import { FormInst, NScrollbar, NRadioGroup, NRadioButton, NForm, NFormItem, NInputGroup, NInputGroupLabel, NInput, NInputNumber, NSelect, NButton, NDynamicInput, useMessage } from 'naive-ui'
import DynamicRulesEditor from './rules.vue'
export default defineComponent({
  props: {
    data: {
      type: Object as PropType<Site>,
      required: true,
    },
  },
  emits: ['generated'],
  components: {
    NScrollbar,
    NRadioGroup,
    NRadioButton,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
    NInputGroup,
    NInputGroupLabel,
    NSelect,
    NButton,
    NDynamicInput,
    DynamicRulesEditor,
  },
  methods: {
    onGenerate() {
      this.$emit('generated', JSON.stringify(this.convertForm2Site(this.formValue)))
    },
  },
  setup(props) {
    const formRef = ref<FormInst | null>(null)
    const message = useMessage()
    // 将普通对象转换为表单键值对对象
    const convertSite2Form = (_site: any): any => {
      const site = JSON.parse(JSON.stringify(_site))
      if (site.headers) site.headers = Object.entries(site.headers).map(([key, value]) => ({ key, value }))
      if (site.sections) {
        site.sections = Object.entries(site.sections).map(([key, value]) => ({ key, value }))
        const expand = (rules: any) => {
          rules = Object.entries(rules).map(([key, value]) => ({ key, value }))
          rules.forEach((rule: any) => (rule.value = Object.entries(rule.value).map(([key, value]) => (key == 'rules' ? { key, value: expand(value) } : { key, value }))))
          return rules
        }
        site.sections.forEach((section: any) => (section.value.rules = expand(section.value.rules)))
      }
      return site
    }
    // 将表单键值对对象规则还原为普通对象
    const convertForm2Site = (_form: any): any => {
      const form = JSON.parse(JSON.stringify(_form))
      const site: any = { ...form }
      site.headers = {}
      site.sections = {}
      form.headers.forEach((item: any) => (site.headers[item.key] = item.value))
      const tran = (rules: any) => {
        const orules: any = {}
        rules.forEach((rule: any) => {
          const oselector: any = {}
          rule.value.forEach((selector: any) => (selector.key == 'rules' ? (oselector[selector.key] = tran(selector.value)) : (oselector[selector.key] = selector.value)))
          orules[rule.key] = oselector
        })
        return orules
      }
      form.sections.forEach((item: any) => {
        site.sections[item.key] = item.value
        if (item.value.rules) {
          site.sections[item.key].rules = tran(item.value.rules)
        }
      })
      return site
    }
    const siteForm = convertSite2Form(props.data)
    console.log(props.data)

    return {
      formRef,
      size: ref<'small' | 'medium' | 'large'>('medium'),
      formValue: ref<{
        name: string
        id: number
        version: number
        author: string
        rating: string
        details: string
        type: string
        icon: string
        headers: { key: string; value: string }[]
        sections: { key: string; value: any }[]
      }>(siteForm),
      options: {
        section: {
          home: '主页',
          search: '搜索',
        },
        type: {
          comic: '漫画/图集',
          image: '图片',
        },
      },
      rules: {
        user: {
          name: {
            required: true,
            message: '请输入姓名',
            trigger: 'blur',
          },
          age: {
            required: true,
            message: '请输入年龄',
            trigger: ['input', 'blur'],
          },
        },
        phone: {
          required: true,
          message: '请输入电话号码',
          trigger: ['input'],
        },
      },
      convertSite2Form,
      convertForm2Site,
      handleValidateClick(e: MouseEvent) {
        e.preventDefault()
        formRef.value?.validate((errors) => {
          if (!errors) {
            message.success('Valid')
          } else {
            console.log(errors)
            message.error('Invalid')
          }
        })
      },
      dynamicInputRule: {
        trigger: 'input',
        validator(rule: unknown, value: string) {
          if (value.length >= 5) return new Error('最多输入四个字符')
          return true
        },
      },
      onCreate() {
        return {
          key: '',
          value: '',
        }
      },
      onCreateSection() {
        return {
          key: 'home',
          value: {
            index: 'https://exhentai.org/?page={page:-1}',
            name: '',
            details: '',
            rules: [],
          },
        }
      },
      onCreateRule() {
        return {
          key: 'title',
          value: [],
        }
      },
      onCreateSelector() {
        return {
          key: 'selector',
          value: '',
        }
      },
    }
  },
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
