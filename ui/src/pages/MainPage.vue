<script setup lang="ts">
import { 
  PlDataTableSettings,
  PlBlockPage, 
  PlBtnPrimary,
  PlSlideModal,
  PlDropdownRef,
  PlAgDataTable, 
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

</script>

<template>
 <PlBlockPage>
    <template #title>Gene Browser</template>
    <template #append>
      <PlBtnPrimary :icon="'settings-2'" @click.stop="showSettings">Settings</PlBtnPrimary>
    </template>

    <PlSlideModal v-model="settingsAreShown">
      <template #title>Settings</template>
      <PlDropdownRef v-model="app.model.args.countsRef" :options="app.model.outputs.countsOptions ?? []"
        label="Select dataset" />
    </PlSlideModal>

    <PlAgDataTable v-if="app.model.ui" :settings="tableSettings" v-model="app.model.ui.tableState" />
  </PlBlockPage>
</template>
