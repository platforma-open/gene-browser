<script setup lang="ts">
import type { PlRef } from '@platforma-sdk/model';
import type {
  PlDataTableSettings } from '@platforma-sdk/ui-vue';
import {
  PlAgDataTable,
  PlAgDataTableToolsPanel,
  PlBlockPage,
  PlBtnGhost,
  PlDropdownRef,
  PlMaskIcon24,
  PlSlideModal,
} from '@platforma-sdk/ui-vue';
import { computed, ref } from 'vue';
import { useApp } from '../app';

const app = useApp();

function setAnchorColumn(ref: PlRef | undefined) {
  app.model.ui.anchorColumn = ref;
}

const tableSettings = computed<PlDataTableSettings>(() => ({
  sourceType: 'ptable',

  pTable: app.model.outputs.pt,

} satisfies PlDataTableSettings));

const settingsAreShown = ref(app.model.outputs.pt === undefined);
const showSettings = () => {
  settingsAreShown.value = true;
};
</script>

<template>
  <PlBlockPage>
    <template #title>Gene Browser</template>
    <template #append>
      <PlAgDataTableToolsPanel />
      <PlBtnGhost @click.stop="showSettings">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>

    <PlSlideModal v-model="settingsAreShown">
      <template #title>Settings</template>
      <PlDropdownRef
        :options="app.model.outputs.countsOptions" :model-value="app.model.ui.anchorColumn"
        label="Select dataset" clearable @update:model-value="setAnchorColumn"
      />
    </PlSlideModal>

    <PlAgDataTable
      v-if="app.model.ui" v-model="app.model.ui.tableState" :settings="tableSettings" show-columns-panel
      show-export-button
    />
  </PlBlockPage>
</template>
