<script setup lang="ts">
import type { GraphMakerProps } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import { useApp } from '../app';
import { ref, watch } from 'vue';
import type { PColumnSpec } from '@platforma-sdk/model';

const app = useApp();

function getDefaultOptions(anchorSpec?: PColumnSpec | undefined,
  DEGPcolSpec?: PColumnSpec | undefined,
) {
  if (!anchorSpec) {
    return undefined;
  }

  const defaults: GraphMakerProps['defaultOptions'] = [
    {
      // Gene count values as Data Source
      inputName: 'value',
      selectedSource: anchorSpec,
    },
    {
      // Ensembl ID as X axis
      inputName: 'x',
      selectedSource: anchorSpec.axesSpec[1],
    },
    {
      // Sample ID as Y axis
      inputName: 'y',
      selectedSource: anchorSpec.axesSpec[0],
    },
  ];

  // Add default filter only if there is at least a DEG Pcolumn
  if (DEGPcolSpec !== undefined) {
    defaults.push({
      // DEG gene list (if present) as filter
      inputName: 'filters',
      selectedSource: DEGPcolSpec,
    });
  }

  return defaults;
};

// Steps needed to reset graph maker after changing input table
const defaultOptions = ref(getDefaultOptions(app.model.outputs.anchorSpec,
  app.model.outputs.DEGPcolSpec,
));
const key = ref(defaultOptions.value ? JSON.stringify(defaultOptions.value) : '');
// Reset graph maker state to allow new selection of defaults
watch(() => app.model.outputs.anchorSpec, (anchorSpec) => {
  delete app.model.ui.graphState.optionsState;
  defaultOptions.value = getDefaultOptions(anchorSpec, app.model.outputs.DEGPcolSpec);
  key.value = defaultOptions.value ? JSON.stringify(defaultOptions.value) : '';
});

</script>

<template>
  <GraphMaker
    :key="key"
    v-model="app.model.ui.heatmapState" chartType="heatmap"
    :p-frame="app.model.outputs.heatmapPf" :defaultOptions="defaultOptions"
  />
</template>
