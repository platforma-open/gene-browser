<script setup lang="ts">
import { GraphMaker, GraphMakerProps, PredefinedGraphOption } from "@milaboratories/graph-maker";
import '@milaboratories/graph-maker/styles';
import { useApp } from "../app";
import { computed } from "vue";

const app = useApp();

const defaultOptions = computed((): GraphMakerProps['defaultOptions'] => {
    const overlapSpec = app.model.outputs.heatmapSpec
    
    if (!overlapSpec) {
        return undefined
    }

    const defaults: GraphMakerProps['defaultOptions'] = [
        {
          // Gene count values as Data Source
          inputName: "value",
          selectedSource: {
            kind: "PColumn",
            name: "pl7.app/rna-seq/countMatrix",
            valueType: "Double",
            axesSpec: [
              {
                name: "pl7.app/rna-seq/geneId",
                type: "String"
              }
            ]
          }
        },
        {
          // Use an available list of DEG genes as filter
          inputName: 'filters',
          selectedSource: {
            kind: "PColumn",
            name: "pl7.app/rna-seq/DEG",
            valueType: "Double",
            axesSpec: [
              {
                name: "pl7.app/rna-seq/geneId",
                type: "String"
              }
            ]
          }
        },
        {
            // Ensembl ID as X axis
            inputName: 'x',
            selectedSource: overlapSpec.spec.axesSpec[1]
        },
        {
            // Sample ID as Y axis
            inputName: 'y',
            selectedSource: overlapSpec.spec.axesSpec[0]
        }
    ];

    return defaults;
})

</script>

<template>
  <GraphMaker chartType="heatmap" :p-frame="app.model.outputs.heatmapPf" 
  v-model="app.model.ui.heatmapState" :defaultOptions="defaultOptions"/>
</template>