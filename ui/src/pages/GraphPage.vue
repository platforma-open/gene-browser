<script
  setup
  lang="ts"
>
import { GraphMaker, PredefinedGraphOption } from "@milaboratories/graph-maker";
import '@milaboratories/graph-maker/styles';
import { PlRef } from "@platforma-sdk/model";
import { PlDropdownRef } from "@platforma-sdk/ui-vue";
import { computed } from "vue";
import { useApp } from "../app";

const app = useApp();

function setAnchorColumn(ref: PlRef | undefined) {
  app.model.ui.anchorColumn = ref;
}

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

const key = computed(() => defaultOptions.value ? JSON.stringify(defaultOptions.value) : '');

</script>

<template>
  <GraphMaker chartType="discrete" :p-frame="app.model.outputs.boxplotPf" v-model="app.model.ui.graphState"
    :default-options="defaultOptions" :key="key">
    <template #settingsSlot>
      <PlDropdownRef :options="app.model.outputs.countsOptions" :model-value="app.model.ui.anchorColumn"
        @update:model-value="setAnchorColumn" label="Select dataset" clearable />
    </template>
  </GraphMaker>
</template>