<script
  setup
  lang="ts"
>
import { GraphMaker, PredefinedGraphOption } from "@milaboratories/graph-maker";
import '@milaboratories/graph-maker/styles';
import { computed } from "vue";
import { useApp } from "../app";

const app = useApp();

const defaultOptions = computed((): PredefinedGraphOption<'discrete'>[] | undefined => {
  if (!app.model.outputs.anchorSpec)
    return undefined;
  if (!app.model.outputs.geneSymbolSpec)
    return undefined;

  return [
    {
      // Gene count values as Y axis
      inputName: 'y',
      selectedSource: app.model.outputs.anchorSpec
    },
    {
      // Gene Symbol in Filter section
      inputName: 'filters',
      selectedSource: app.model.outputs.geneSymbolSpec
    }
  ]
})
</script>

<template>
  <GraphMaker chartType="discrete" :p-frame="app.model.outputs.boxplotPf" v-model="app.model.ui.graphState"
    :default-options="defaultOptions" />
</template>