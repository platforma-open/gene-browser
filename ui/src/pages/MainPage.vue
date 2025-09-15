<script
  setup
  lang="ts"
>
import { PlRef } from '@platforma-sdk/model';
import {
  PlAgDataTableV2,
  PlBlockPage,
  PlBtnGhost,
  PlDropdownRef,
  PlMaskIcon24,
  PlSlideModal,
  usePlDataTableSettingsV2
} from '@platforma-sdk/ui-vue';
import { ref } from 'vue';
import { useApp } from '../app';

const app = useApp();

function setAnchorColumn(ref: PlRef | undefined) {
  app.model.ui.anchorColumn = ref;
}

const tableSettings = usePlDataTableSettingsV2({
  model: () => app.model.outputs.pt
});

const settingsAreShown = ref(app.model.outputs.pt === undefined)
const showSettings = () => { settingsAreShown.value = true }
</script>

<template>
  <PlBlockPage>
    <template #title>Gene Browser</template>
    <template #append>
      <PlBtnGhost @click.stop="showSettings">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>

    <PlSlideModal v-model="settingsAreShown">
      <template #title>Settings</template>
      <PlDropdownRef :options="app.model.outputs.countsOptions" :model-value="app.model.ui.anchorColumn"
        @update:model-value="setAnchorColumn" label="Select dataset" clearable />
    </PlSlideModal>

    <PlAgDataTableV2 v-if="app.model.ui" :settings="tableSettings" v-model="app.model.ui.tableState" show-columns-panel
      show-export-button />
  </PlBlockPage>
</template>
