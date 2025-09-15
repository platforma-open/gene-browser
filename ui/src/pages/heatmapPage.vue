<script
  setup
  lang="ts"
>
import { GraphMaker, GraphMakerProps, PredefinedGraphOption } from "@milaboratories/graph-maker";
import '@milaboratories/graph-maker/styles';
import { computed } from "vue";
import { useApp } from "../app";

const app = useApp();

const defaultOptions = computed((): PredefinedGraphOption<'heatmap'>[] | undefined => {
  if (!app.model.outputs.anchorSpec)
    return undefined;

  const defaults: GraphMakerProps['defaultOptions'] = [
    {
      // Gene count values as Data Source
      inputName: "value",
      selectedSource: app.model.outputs.anchorSpec
    },
    {
      // Ensembl ID as X axis
      inputName: "x",
      selectedSource: app.model.outputs.anchorSpec.axesSpec[1]
    },
    {
      // Sample ID as Y axis
      inputName: "y",
      selectedSource: app.model.outputs.anchorSpec.axesSpec[0]
    },
  ];

  // Add default filter only if there is at least a DEG Pcolumn 
  if (app.model.outputs.DEGpf &&
    app.model.outputs.DEGpf.length !== 0) {
    // Extend default options
    defaults.push({
      // DEG gene list (if present) as filter
      inputName: "filters",
      selectedSource: app.model.outputs.DEGpf[0].spec
    })
    // Add contrast as tab by
    defaults.push({
      // DEG gene list (if present) as filter
      inputName: "tabBy",
      selectedSource: app.model.outputs.DEGpf[0].spec.axesSpec[0]
    })
  }

  return defaults;
})

</script>

<template>
  <GraphMaker chartType="heatmap" :p-frame="app.model.outputs.heatmapPf" v-model="app.model.ui.heatmapState"
    :defaultOptions="defaultOptions" />
</template>