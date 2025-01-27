import { GraphMakerState } from '@milaboratories/graph-maker';
import {
  AxisSpec,
  BlockModel,
  createPFrameForGraphs,
  createPlDataTable,
  InferOutputsType,
  isPColumn,
  isPColumnSpec,
  PColumnSpec,
  PFrameHandle,
  PlDataTableState,
  PlRef
} from '@platforma-sdk/model';

export type UiState = {
  tableState: PlDataTableState;
  graphState: GraphMakerState;
  anchorColumn?: PlRef;
  heatmapState: GraphMakerState;
};

export type BlockArgs = {
  countsRef?: PlRef;
};

function getGeneIdAxis(spec: PColumnSpec): AxisSpec | undefined {
  if (
    spec.axesSpec.length === 2 &&
    spec.axesSpec[0].name === 'pl7.app/sampleId' &&
    spec.axesSpec[1].name === 'pl7.app/rna-seq/geneId'
  )
    return spec.axesSpec[1];
  return undefined;
}

function matchGeneIdAxis(a?: AxisSpec, b?: AxisSpec): boolean {
  return a?.domain?.['pl7.app/blockId'] === b?.domain?.['pl7.app/blockId'];
}
export const model = BlockModel.create()

  .withArgs<BlockArgs>({})

  .withUiState<UiState>({
    tableState: {
      gridState: {},
      pTableParams: {
        sorting: [],
        filters: []
      }
    },
    graphState: {
      template: 'box',
      title: 'Gene Expression'
    },
    heatmapState: {
      template: "heatmapClustered",
      title: "Expression Heatmap"
    }
  })

   // Activate "Run" button only after these conditions get fulfilled
   .argsValid((ctx) =>  // Input dataset has been selected
    ctx.uiState?.anchorColumn !== undefined )

  // Filters to define allowed input data
  .output('countsOptions', (ctx) =>
    ctx.resultPool.getOptions((spec) => isPColumnSpec(spec) && 
                // We temporarilly add backwards compatibility (spec.name === 'countMatrix')
                // @TODO: remove it when versions are stable
                (spec.name === 'pl7.app/rna-seq/countMatrix' || spec.name === 'countMatrix')
              )
  )

  .output('anchorSpec', (ctx) => {
    // return the Reference of the p-column selected as input dataset in Settings
    if (!ctx.uiState?.anchorColumn) return undefined;

    // Get the specs of that selected p-column
    const anchorColumn = ctx.resultPool.getPColumnByRef(ctx.uiState?.anchorColumn);
    const anchorSpec = anchorColumn?.spec;
    if (!anchorSpec) {
      console.error('Anchor spec is undefined or is not PColumnSpec', anchorSpec);
      return undefined;
    }

    return anchorSpec;
  })

  .output('pt', (ctx) => {
    // return the Reference of the p-column selected as input dataset in Settings
    if (!ctx.uiState?.anchorColumn) return undefined;

    // Get the specs of that selected p-column
    const anchorColumn = ctx.resultPool.getPColumnByRef(ctx.uiState?.anchorColumn);
    if (!anchorColumn) {
      console.error('Anchor column is undefined or is not PColumn');
      return undefined;
    }

    const anchorGeneAxis = getGeneIdAxis(anchorColumn.spec);
    const moreColumns = ctx.resultPool
      .getData()
      .entries.map((o) => o.obj)
      .filter(isPColumn)
      .filter((col) => {
        if (col.id === anchorColumn.id) return false;

        // Normalization stage has to be same as in input dataset (anchorColumn)
        if (
          col.spec.domain?.['pl7.app/rna-seq/normalized'] &&
          (col.spec.domain['pl7.app/rna-seq/normalized'] !==
            anchorColumn.spec.domain?.['pl7.app/rna-seq/normalized']) 
        )
          return false

        // We temporarilly add backwards compatibility
        // @TODO: remove it when versions are stable
        if (col.spec.annotations?.['pl7.app/rna-seq/normalized'] && 
        (col.spec.annotations['pl7.app/rna-seq/normalized'] !==
          anchorColumn.spec.annotations?.['pl7.app/rna-seq/normalized'])
        )
          return false;

        const geneAxis = getGeneIdAxis(col.spec);
        if (!geneAxis || !matchGeneIdAxis(anchorGeneAxis, geneAxis)) return false;

        return true;
      });

    const columns = [anchorColumn, ...moreColumns];

    // for the table purposes, we set "pl7.app/axisNature": "heterogeneous" on sample axis
    anchorColumn.spec.annotations!['pl7.app/table/hValue'] = 'true';
    for (const col of columns) {
      for (const axis of col.spec.axesSpec) {
        if (axis.name === 'pl7.app/sampleId') {
          axis.annotations!['pl7.app/axisNature'] = 'heterogeneous';
        }
      }
    }

    if (!columns) return undefined;

    return createPlDataTable(ctx, columns, ctx.uiState?.tableState);
  })

  // Boxplot Pf without DEG
  // @TODO Allow histogram of DEG values
  .output('boxplotPf', (ctx): PFrameHandle | undefined => {
    return ctx.createPFrame(
      ctx.resultPool
        .getData()
        .entries.map((c) => c.obj)
        .filter(isPColumn)
        .filter((col) => col.spec.name !== 'pl7.app/rna-seq/DEG' )
    );
  })

  // Heatmap Pf with DEG
  .output('heatmapPf', (ctx): PFrameHandle | undefined => {
    return createPFrameForGraphs(ctx,
      ctx.resultPool
        .getData()
        .entries.map((c) => c.obj)
        .filter(isPColumn)
    );
  })

  .output('test', (ctx) => {
    const columns = (ctx.resultPool
        .getData()
        .entries.map((c) => c.obj)
        .filter(isPColumn)).filter((col) => {
            if (1==1) {return col.spec} 
            })
    return columns
  })

  // Get gene symbol spec
  .output('geneSymbolSpec', (ctx) => {
    // return the Reference of the p-column selected as input dataset in Settings
    if (!ctx.uiState?.anchorColumn) return undefined;

    // Get the specs of that selected p-column
    const anchorColumn = ctx.resultPool.getPColumnByRef(ctx.uiState?.anchorColumn);
    if (!anchorColumn) {
      console.error('Anchor column is undefined or is not PColumn');
      return undefined;
    }

    const anchorGeneAxis = getGeneIdAxis(anchorColumn.spec);
    const symbolColumns = ctx.resultPool
      .getData()
      .entries.map((o) => o.obj)
      .filter(isPColumn)
      .filter((col) => {

        
        if (
          col.spec.name === 'geneSymbols' &&
          // Gene ID axis has to be same as in input data
          matchGeneIdAxis(anchorGeneAxis, getGeneIdAxis(col.spec) )
        ) {
          return true;
        }

        return false;
      });

    return symbolColumns[0].spec
    })

    // Get DEG pframe
  .output('DEGpf', (ctx) => {
    // return the Reference of the p-column selected as input dataset in Settings
    if (!ctx.uiState?.anchorColumn) return undefined;

    // Get the specs of that selected p-column
    const anchorColumn = ctx.resultPool.getPColumnByRef(ctx.uiState?.anchorColumn);
    if (!anchorColumn) {
      console.error('Anchor column is undefined or is not PColumn');
      return undefined;
    }

    const anchorGeneAxis = getGeneIdAxis(anchorColumn.spec);
    const DEGcolumns = ctx.resultPool
      .getData()
      .entries.map((o) => o.obj)
      .filter(isPColumn)
      .filter((col) => {

        
        if (
          col.spec.name === 'pl7.app/rna-seq/DEG' 
        ) {
          return true;
        }

        return false;
      });

    return DEGcolumns
    })

  .sections([
    { type: 'link', href: '/', label: 'Main' },
    { type: 'link', href: '/graph', label: 'Gene Expression' },
    { type: "link", href: "/heatmap", label: "Expression Heatmap" },
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
