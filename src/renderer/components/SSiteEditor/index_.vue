<template>
  <n-form :model="model" style="margin-top: 10rem;">
    <n-dynamic-input
      v-model:value="model.dynamicInputValue"
      item-style="margin-bottom: 0;"
      :on-create="onCreate"
      #="{ index, value }"
    >
      <div style="display: flex">
        <n-form-item
          ignore-path-change
          :show-label="false"
          :path="`dynamicInputValue[${index}].name`"
          :rule="dynamicInputRule"
        >
          <n-input
            v-model:value="model.dynamicInputValue[index].name"
            placeholder="Name"
            @keydown.enter.prevent
          />
        </n-form-item>
        <div style="height: 34px; line-height: 34px; margin: 0 8px">
          =
        </div>
        <n-form-item
          ignore-path-change
          :show-label="false"
          :path="`dynamicInputValue[${index}].value`"
          :rule="dynamicInputRule"
        >
          <n-input
            v-model:value="model.dynamicInputValue[index].value"
            placeholder="Value"
            @keydown.enter.prevent
          />
        </n-form-item>
      </div>
    </n-dynamic-input>
  </n-form>
  <pre>{{ JSON.stringify(model.dynamicInputValue, null, 2) }}</pre>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

import { FormInst, NRadioGroup, NRadioButton, NForm, NFormItem, NInput, NButton, NDynamicInput, useMessage } from 'naive-ui'

export default defineComponent({
  components: {
    NRadioGroup,
    NRadioButton,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NDynamicInput,
  },
  setup () {
    return {
      dynamicInputRule: {
        trigger: 'input',
        validator (rule: unknown, value: string) {
          if (value.length >= 5) return new Error('最多输入四个字符')
          return true
        }
      },
      model: ref({
        dynamicInputValue: [{ value: '', name: '' }]
      }),
      onCreate () {
        return {
          name: '',
          value: ''
        }
      }
    }
  }
})
</script>