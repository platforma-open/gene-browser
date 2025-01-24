import { model } from '@platforma-open/milaboratories.gene-browser.model';
import { defineApp } from '@platforma-sdk/ui-vue';
import MainPage from './pages/MainPage.vue';
import GraphPage from './pages/GraphPage.vue';
import heatmapPage from './pages/heatmapPage.vue';

export const sdkPlugin = defineApp(model, (app) => {
  return {
    progress: () => {
      return app.model.outputs.isRunning;
    },
    routes: {
      '/': () => MainPage,
      '/graph': () => GraphPage,
      '/heatmap': () => heatmapPage
    }
  };
});

export const useApp = sdkPlugin.useApp;
