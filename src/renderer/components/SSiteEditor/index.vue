<template lang="pug">
.s-site-editor
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
    
      //- NInput(v-model:value='formValue.type', placeholder='规则类型')
    NFormItem(label='图标 - icon', path='icon')
      NInput(v-model:value='formValue.icon', placeholder='规则图标')
    NFormItem(label='请求头 - headers', path='headers')
      NDynamicInput(v-model:value='formValue.headers', #='{ index, value }' :on-create="onCreate" show-sort-button)
        div(style='display: flex')
          NFormItem(ignore-path-change, :show-label='false', :path='`formValue.headers[${index}].key`', :rule='dynamicInputRule')
            NInput(v-model:value='formValue.headers[index].key', placeholder='Name', @keydown.enter.prevent='')
          div(style='height: 34px; line-height: 34px; margin: 0 8px') =
          NFormItem(ignore-path-change, :show-label='false', :path='`formValue.headers[${index}].value`', :rule='dynamicInputRule')
            NInput(v-model:value='formValue.headers[index].value', placeholder='Value', @keydown.enter.prevent='')
    NFormItem(label='板块列表 - sections', path='sections')
      NDynamicInput(v-model:value='formValue.sections', #='{ index, value }' :on-create="onCreateSection")
        NFormItem.section-name(ignore-path-change, label='', :path='`formValue.sections[${index}].key`',)
          NSelect(v-model:value="formValue.sections[index].key" :options="Object.entries(options.section).map(([value, label]) => ({label, value}))" @keydown.enter.prevent='')
        div.sections
          NFormItem(label='索引', path='details')
            NInput(v-model:value='formValue.sections[index].value.index', placeholder='规则详情')
          NFormItem(v-if="formValue.sections[index].value.name" label='名称', path='type')
            NInput(v-model:value='formValue.sections[index].value.name', placeholder='规则类型')
          NFormItem(v-if="formValue.sections[index].value.detail" label='描述', path='icon')
            NInput(v-model:value='formValue.sections[index].value.detail', placeholder='规则图标')
          NDynamicInput(v-model:value='formValue.sections[index].value.rules', #='{ i, _ }' :on-create="onCreateSection")
            NFormItem.section-name(ignore-path-change, label='', :path='`formValue.sections[${index}].key`',)
              NSelect(v-model:value="formValue.sections[index].key" :options="Object.entries(options.section).map(([value, label]) => ({label, value}))" @keydown.enter.prevent='')
          //- NFormItem(label='规则', path='icon')
            NFormItem(label='', path='details' v-for="(v, k) in formValue.sections[index].value.rules")
              span {{formValue.sections[index].value.rules[k]}}
              //- NInput(v-model:value='formValue.sections[index].value.rules[v]', placeholder='规则详情')
    NFormItem
      NButton(attr-type='button', @click='handleValidateClick') 验证
  pre {{ JSON.stringify(formValue, null, 2) }}
</template>

<script lang="ts">
import { defineComponent, ref, defineProps, PropType } from 'vue'
import { FormInst, NRadioGroup, NRadioButton, NForm, NFormItem, NInputGroup, NInputGroupLabel, NInput, NInputNumber, NSelect, NButton, NDynamicInput, useMessage } from 'naive-ui'

export default defineComponent({
  props: {
    data: {
      // 提供相对 `Object` 更确定的类型
      type: Object as PropType<Site>,
      required: true,
    },
  },
  components: {
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
  },
  setup(props) {
    console.log(props.data)
    console.log(props.data)

    const site = JSON.parse(JSON.stringify(props.data))

    if (site.headers) site.headers = Object.entries(site.headers).map(([key, value]) => ({ key, value }))
    if (site.sections) {
      site.sections = Object.entries(site.sections).map(([key, value]) => ({ key, value }))

      const expand = (rules: any) => {
        rules = Object.entries(rules).map(([key, value]) => {
          // if (key == 'rules') {
          //   // console.log('rv', rules[key], 'k', key, 'v', value);
          //   rules[key] = expand(value)
          // }
          return { key, value }
        })
        rules.forEach((rule: any) => {
          rule.value = Object.entries(rule.value).map(([key, value]) => {
            // console.log('rv', rule.value, 'k', key, 'v', value);
            if (key == 'rules') {
              rule.value[key] = expand(value)
              console.log('rv', rule.value, 'k', key, 'v', value)
            }
            return { key, value }
          })
        })
        return rules
      }

      site.sections.forEach((section: any) => {
        section.value.rules = expand(section.value.rules)
      })
    }
    const formRef = ref<FormInst | null>(null)
    const message = useMessage()

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
        sections: { key: string; value: Section }[]
      }>(site),
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
          key: '',
          index: 'https://exhentai.org/?page={page:-1}',
          name: '主页',
          details: '主页详情',
          rules: {
            title: {
              selector: '$(.gl4t.glname).text()',
            },
            coverUrl: {
              selector: '$(.gl3t a img).attr(src)',
            },
            $children: {},
          },
        }
      },
    }
  },
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
