<script setup lang="ts">
import { GraphMaker, GraphMakerProps, PredefinedGraphOption } from "@milaboratories/graph-maker";
import '@milaboratories/graph-maker/styles';
import { useApp } from "../app";
import { computed } from "vue";

const app = useApp();

const defaultOptions: PredefinedGraphOption<"discrete">[] = [
  {
    // Gene Symbol in Filter section
    inputName: 'filters',
    selectedSource: {
      kind: "PColumn",
      name: "geneSymbols",
      valueType: "String",
      axesSpec: [
        {
          name: "pl7.app/rna-seq/geneId",
          type: "String"
        }
      ]
    }
  },
  {
    // Gene count values as Y axis
    inputName: "y",
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
]

</script>

<template>
  <GraphMaker chartType="discrete" :p-frame="app.model.outputs.plotPf" 
  v-model="app.model.ui.graphState" :defaultOptions="defaultOptions"/>
</template>