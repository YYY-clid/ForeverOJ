<template>
    <div id="code-editor" ref="codeEditorRef" style="min-height: 600px; height: 75vh;" />
    
    <!-- <a-button @click="fillValue">填充值</a-button> -->
</template>

<script lang="ts" setup>
import * as monaco from "monaco-editor";
import { languages } from "monaco-editor/esm/metadata";
import { onMounted, ref, toRaw, withDefaults, defineProps, watch } from "vue";


/**
 * 定义组件属性类型
 */ 
interface Props {
  value: string;
  language?: string;
  handleChange: (v: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  value: () => "",
  language: () => "java",
  handleChange: (v: string) => {
    console.log(v);
  },
});

const codeEditorRef = ref();
const codeEditor = ref();

// const fillValue = () => {
//     if(!codeEditor.value) {
//         return;
//     }
//     toRaw(codeEditor.value).setValue("新的值")
// }

watch(() => props.language, () => {
    codeEditor.value = monaco.editor.create(codeEditorRef.value, {
        value: props.value,
        language: props.language,
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
})


onMounted(() => {
    if(!codeEditorRef.value) {
        return;
    }

    // Hover on each property to see its docs!
    codeEditor.value = monaco.editor.create(codeEditorRef.value, {
        value: props.value,
        language: props.language,
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