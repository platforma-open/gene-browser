<script setup lang="ts">
import { GraphMaker } from "@milaboratories/graph-maker";
import '@milaboratories/graph-maker/styles';
import { useApp } from "../app";

const app = useApp();

</script>

<template>
  <GraphMaker chartType="discrete" :p-frame="app.model.outputs.plotPf" 
  v-model="app.model.ui.graphState" />
</template>