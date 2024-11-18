<script setup lang="ts">
import { GraphMaker, GraphMakerSettings } from "@milaboratories/graph-maker";
import '@milaboratories/graph-maker/styles';
import { useApp } from "../app";

const app = useApp();

const settings = {
  chartType: 'scatterplot',
  template: 'dots',
  title: '',
  defaultOptions: [{
    inputName: 'y',
    selectedSource: {
      kind: 'PColumn',
      name: 'countMatrix',
      valueType: 'Int'
    }
  }]
   } as GraphMakerSettings;
</script>

<template>
    <graph-maker :pFrame="app.model.outputs.pf" v-model="settings" />
</template>