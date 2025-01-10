<script setup lang="ts">
import { GraphMaker, GraphMakerProps } from "@milaboratories/graph-maker";
import '@milaboratories/graph-maker/styles';
import { computed } from "vue";
import { useApp } from "../app";

const app = useApp();

const defaultOptions = computed((): GraphMakerProps['defaultOptions'] => {
  if (!app.model.outputs.anchorSpec)
    return undefined;

  return [
    {
      inputName: 'y',
      selectedSource: app.model.outputs.anchorSpec
    }
  ]
})
</script>

<template>
  <GraphMaker chartType="discrete" :p-frame="app.model.outputs.plotPf" v-model="app.model.ui.graphState"
    :default-options="defaultOptions" />
</template>