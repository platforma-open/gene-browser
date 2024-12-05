<script setup lang="ts">
import { PTableColumnSpec } from '@platforma-sdk/model';
import {
  PlAgDataTable,
  PlAgDataTableController,
  PlAgDataTableToolsPanel,
  PlBlockPage,
  PlBtnGhost,
  PlDataTableSettings,
  PlDropdownRef,
  PlMaskIcon24,
  PlSlideModal,
} from '@platforma-sdk/ui-vue';
import { computed, ref } from 'vue';
import { useApp } from '../app';

const app = useApp();

const tableSettings = computed<PlDataTableSettings>(() => ({
  sourceType: "ptable",

  pTable: app.model.outputs.pt,

} satisfies PlDataTableSettings));

const settingsAreShown = ref(app.model.outputs.pt === undefined)
const showSettings = () => { settingsAreShown.value = true }
const columns = ref<PTableColumnSpec[]>([]);
const tableInstance = ref<PlAgDataTableController>();

</script>

<template>
  <PlBlockPage>
    <template #title>Gene Browser</template>
    <template #append>
      <PlAgDataTableToolsPanel />
      <PlBtnGhost @click.stop="() => tableInstance?.exportCsv()">
        Export
        <template #append>
          <PlMaskIcon24 name="export" />
        </template>
      </PlBtnGhost>
      <PlBtnGhost @click.stop="showSettings">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>

    <PlSlideModal v-model="settingsAreShown">
      <template #title>Settings</template>
      <PlDropdownRef v-model="app.model.args.countsRef" :options="app.model.outputs.countsOptions"
        label="Select dataset" />
    </PlSlideModal>

    <PlAgDataTable v-if="app.model.ui" :settings="tableSettings" v-model="app.model.ui.tableState" show-columns-panel
      ref="tableInstance" @columns-changed="(newColumns) => (columns = newColumns)" />
  </PlBlockPage>
</template>
