<script setup lang="ts">
import type { GraphMakerProps } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import { ref, watch } from 'vue';
import { useApp } from '../app';
import type { PColumnSpec } from '@platforma-sdk/model';

const app = useApp();

function getDefaultOptions(anchorSpec?: PColumnSpec | undefined,
  geneSymbolSpec?: PColumnSpec | undefined,
) {
  if (!anchorSpec) {
    return undefined;
  }
  if (!geneSymbolSpec) {
    return undefined;
  }
  const defaults: GraphMakerProps['defaultOptions'] = [
    {
      // Gene count values as Y axis
      inputName: 'y',
      selectedSource: anchorSpec,
    },
    {
      // Gene Symbol in Filter section
      inputName: 'filters',
      selectedSource: geneSymbolSpec,
    },
  ];

  return defaults;
};

// Steps needed to reset graph maker after changing input table
const defaultOptions = ref(getDefaultOptions(app.model.outputs.anchorSpec,
  app.model.outputs.geneSymbolSpec,
));
const key = ref(defaultOptions.value ? JSON.stringify(defaultOptions.value) : '');
// Reset graph maker state to allow new selection of defaults
watch(() => app.model.outputs.anchorSpec, (anchorSpec) => {
  delete app.model.ui.graphState.optionsState;
  defaultOptions.value = getDefaultOptions(anchorSpec, app.model.outputs.geneSymbolSpec);
  key.value = defaultOptions.value ? JSON.stringify(defaultOptions.value) : '';
});

</script>

<template>
  <GraphMaker
    :key="key"
    v-model="app.model.ui.graphState" chartType="discrete" :p-frame="app.model.outputs.boxplotPf"
    :default-options="defaultOptions"
  />
</template>
