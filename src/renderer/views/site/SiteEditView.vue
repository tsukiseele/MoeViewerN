<template lang="pug">
div
  div
  n-radio-group(v-model:value='size' name='left-size' style='margin-bottom: 12px')
    n-radio-button(value='small')
      | &#x5C0F;
    n-radio-button(value='medium')
      | &#x4E2D;
    n-radio-button(value='large')
      | &#x5927;
  n-form(ref='formRef' inline='' :label-width='80' :model='formValue' :rules='rules' :size='size')
    n-form-item(label='姓名' path='user.name')
      n-input(v-model:value='formValue.user.name' placeholder='输入姓名')
    n-form-item(label='年龄' path='user.age')
      n-input(v-model:value='formValue.user.age' placeholder='输入年龄')
    n-form-item(label='电话号码' path='phone')
      n-input(v-model:value='formValue.phone' placeholder='电话号码')
    n-form-item
      n-button(attr-type='button' @click='handleValidateClick')
        | &#x9A8C;&#x8BC1;
  pre {{ JSON.stringify(formValue, null, 2) }}
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { FormInst, useMessage } from 'naive-ui'

export default defineComponent({
  setup () {
    const formRef = ref<FormInst | null>(null)
    const message = useMessage()
    return {
      formRef,
      size: ref<'small' | 'medium' | 'large'>('medium'),
      formValue: ref({
        user: {
          name: '',
          age: ''
        },
        phone: ''
      }),
      rules: {
        user: {
          name: {
            required: true,
            message: '请输入姓名',
            trigger: 'blur'
          },
          age: {
            required: true,
            message: '请输入年龄',
            trigger: ['input', 'blur']
          }
        },
        phone: {
          required: true,
          message: '请输入电话号码',
          trigger: ['input']
        }
      },
      handleValidateClick (e: MouseEvent) {
        e.preventDefault()
        formRef.value?.validate((errors) => {
          if (!errors) {
            message.success('Valid')
          } else {
            console.log(errors)
            message.error('Invalid')
          }
        })
      }
    }
  }
})
</script>