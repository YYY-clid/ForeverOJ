<template>
    <div id="code-editor" ref="codeEditorRef" style="min-height: 400px;" />
    <!-- <a-button @click="fillValue">填充值</a-button> -->
</template>

<script lang="ts" setup>
import * as monaco from "monaco-editor";
import { onMounted, ref, toRaw, withDefaults, defineProps } from "vue";


/**
 * 定义组件属性类型
 */ 
interface Props {
  value: string;
  handleChange: (v: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  value: () => "",
  handleChange: (v: string) => {
    console.log(v);
  },
});

const codeEditorRef = ref();
const codeEditor = ref();

const fillValue = () => {
    if(!codeEditor.value) {
        return;
    }
    toRaw(codeEditor.value).setValue("新的值")
}

onMounted(() => {
    if(!codeEditorRef.value) {
        return;
    }

    // Hover on each property to see its docs!
    codeEditor.value = monaco.editor.create(codeEditorRef.value, {
        value: props.value,
        language: "java",
        automaticLayout: true,
        minimap: { 
            enabled: true,
        },
        colorDecorators: true,
        // lineNumbers: "off",
        // roundedSelection: false,
        // scrollBeyondLastLine: false,
        readOnly: false,
        theme: "vs-dark",
    });
    codeEditor.value.onDidChangeModelContent(() => {
        props.handleChange(toRaw(codeEditor.value).getValue())
    })
})



</script>

<style scoped>

</style>