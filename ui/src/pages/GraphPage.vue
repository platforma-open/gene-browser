<script setup lang="ts">
import type { GraphMakerProps } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import { computed } from 'vue';
import { useApp } from '../app';

const app = useApp();

const defaultOptions = computed((): GraphMakerProps['defaultOptions'] => {
  if (!app.model.outputs.anchorSpec)
    return undefined;
  if (!app.model.outputs.geneSymbolSpec)
    return undefined;

  return [
    {
      // Gene count values as Y axis
      inputName: 'y',
      selectedSource: app.model.outputs.anchorSpec,
    },
    {
      // Gene Symbol in Filter section
      inputName: 'filters',
      selectedSource: app.model.outputs.geneSymbolSpec,
    },
  ];
});
</script>

<template>
  <GraphMaker
    v-model="app.model.ui.graphState" chartType="discrete" :p-frame="app.model.outputs.boxplotPf"
    :default-options="defaultOptions"
  />
</template>
