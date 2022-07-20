<template lang="pug">
NDynamicInput.field-input(v-model:value='rules', #='{ index: ruleIndex, _ }' :on-create="onCreateRule")
  NFormItem.section-name(ignore-path-change, label='字段', :path='`rules[${ruleIndex}].key`',)
    NInput(v-model:value='rules[ruleIndex].key', placeholder='规则详情')
  div(style='margin: 32px 8px 0 8px') : 

  NFormItem
    NDynamicInput(v-model:value='rules[ruleIndex].value', #='{ index: fieldIndex, _ }' :on-create="onCreateSelector")
      NInput.prop-name(v-model:value='rules[ruleIndex].value[fieldIndex].key', placeholder='属性名' style="max-width: 160px; align-self: flex-start;")
      div(style='margin: 8px 8px 0 8px') = 
      NInput.prop-value(v-if="rules[ruleIndex].value[fieldIndex].key != 'rules'" v-model:value='rules[ruleIndex].value[fieldIndex].value', placeholder='属性值')
      dynamic-rules-editor(v-else v-model:data="rules[ruleIndex].value[fieldIndex].value")    
        
</template>

<script lang="ts">
import { defineComponent, ref, defineProps, PropType } from 'vue'
import { FormInst, NRadioGroup, NRadioButton, NForm, NFormItem, NInputGroup, NInputGroupLabel, NInput, NInputNumber, NSelect, NButton, NDynamicInput, useMessage } from 'naive-ui'

export default defineComponent({
  name: 'dynamic-rules-editor',
  props: {
    data: {
      type: Array as PropType<{ key: string; value: any }[]>,
      required: true,
    },
  },
  emits: ['update:data'],
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
  computed: {
    rules: {
      get(): { key: string; value: any }[] {
        return this.data
      },
      set(value: { key: string; value: any }[]) {
        this.$emit('update:data', value)
      },
    },
  },
  setup(props) {
    const formRef = ref<FormInst | null>(null)
    const message = useMessage()

    return {
      formRef,
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
.section-name {
  flex: 0 0 100px;
  align-self: flex-start;
}

.prop-name {
  flex: 0 0 100px;
  // align-self: flex-start;
}

// ::v-deep {
//   .field-input .n-dynamic-input-item .n-form-item:first-of-type {
//     display: flex;
//     flex-direction: column;
//   }
// }
:deep(.field-input .n-dynamic-input-item .n-form-item:first-of-type) {
  display: flex;
  flex-direction: column;
}

:deep(.prop-value) {
  flex: 1;
}
</style>
