import { GraphMakerState } from '@milaboratories/graph-maker';
import {
  BlockModel,
  createPFrameForGraphs,
  createPlDataTable,
  InferOutputsType,
  isPColumn,
  isPColumnSpec,
  PFrameHandle,
  PlDataTableState,
  PlRef,
  PTableHandle,
  ValueType
} from '@platforma-sdk/model';

export type UiState = {
  tableState: PlDataTableState;
  graphState: GraphMakerState;
  heatmapState: GraphMakerState;
  anchorColumn?: PlRef;
};

export type BlockArgs = {
  countsRef?: PlRef;
};

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
      template: "heatmap",
      title: "Expression Heatmap"
    }
  })

  // Activate "Run" button only after these conditions get fulfilled
  .argsValid((ctx) =>  // Input dataset has been selected
                      ctx.uiState?.anchorColumn !== undefined )

  .output('countsOptions', (ctx) =>
    ctx.resultPool.getOptions((spec) => isPColumnSpec(spec) && 
                                        spec.name === 'pl7.app/rna-seq/countMatrix')
  )

  .output('pt', (ctx) => {
    // const pCols = ctx.outputs?.resolve('normPf')?.getPColumns();
    // if (pCols === undefined) {
    //   return undefined;
    // }

    // Count data
    // return the Reference of the Pcolumn selected as input dataset in Settings
    const anchorColumn = ctx.uiState?.anchorColumn;
    if (!anchorColumn) return undefined;
    // Get the specs of that selected Pcolumn
    const anchorSpec = ctx.resultPool.getSpecByRef(anchorColumn);
    if (!anchorSpec || !isPColumnSpec(anchorSpec)) {
      console.error('Anchor spec is undefined or is not PColumnSpec', anchorSpec);
      return undefined;
    }

    const columns = ctx.resultPool
    .getData()
    .entries.map((o) => o.obj)
    .filter(isPColumn)
    .filter((col) => {
      if (!isPColumnSpec(col.spec)) return false;

      // Include count data if matches user input blockID and normlization stage
     if(col.spec.domain?.['pl7.app/blockId'] === anchorSpec.domain?.['pl7.app/blockId'] &&
      col.spec.domain?.['pl7.app/rna-seq/normalized'] === anchorSpec.domain?.['pl7.app/rna-seq/normalized']
     ){
      return col.spec
      // Include Gene Symbol data from same blockID as input counts
      } else if (col.spec.domain?.['pl7.app/blockId'] === anchorSpec.domain?.['pl7.app/blockId'] &&
        col.spec.annotations?.['pl7.app/label'] === 'Gene Symbol'
     ){
      return col.spec
     } else {
      return undefined
     }
    });

    // return createPlDataTable(ctx, pCols, ctx.uiState?.tableState);
    return createPlDataTable(ctx, columns, ctx.uiState?.tableState);
  })

  .output('plotPf', (ctx): PFrameHandle | undefined => {
    // Count data
    // return the Reference of the Pcolumn selected as input dataset in Settings
    const anchorColumn = ctx.uiState?.anchorColumn;
    if (!anchorColumn) return undefined;
    // Get the specs of that selected Pcolumn
    const anchorSpec = ctx.resultPool.getSpecByRef(anchorColumn);
    if (!anchorSpec || !isPColumnSpec(anchorSpec)) {
      console.error('Anchor spec is undefined or is not PColumnSpec', anchorSpec);
      return undefined;
    }

    const columns = ctx.resultPool
    .getData()
    .entries.map((o) => o.obj)
    .filter(isPColumn)
    .filter((col) => {
      if (!isPColumnSpec(col.spec)) return false;

     if(col.spec.domain?.['pl7.app/blockId'] === anchorSpec.domain?.['pl7.app/blockId'] &&
      col.spec.domain?.['pl7.app/rna-seq/normalized'] === anchorSpec.domain?.['pl7.app/rna-seq/normalized']
     ){
      return col.spec
     } else if (col.spec.domain?.['pl7.app/blockId'] === anchorSpec.domain?.['pl7.app/blockId'] &&
      col.spec.annotations?.['pl7.app/label'] === 'Gene Symbol'
      ){
        return col.spec
     } else {
        return undefined
     }
    });

    // enriching with upstream metadata
    const valueTypes = ['Int', 'Float', 'Double', 'String'] as ValueType[];
    const upstream = ctx.resultPool
      .getData()
      .entries.map((v) => v.obj)
      .filter(isPColumn)
      .filter((column) => valueTypes.find((valueType) => (valueType === column.spec.valueType) && (
                                                          column.id.includes("metadata")
                                                        )
    ));

    return ctx.createPFrame([...columns, ...upstream]);
  })

  .output("heatmapSpec", (ctx) => {
    // Count data
    // return the Reference of the Pcolumn selected as input dataset in Settings
    const anchorColumn = ctx.uiState?.anchorColumn;
    if (!anchorColumn) return undefined;
    // Get the specs of that selected Pcolumn
    const anchorSpec = ctx.resultPool.getSpecByRef(anchorColumn);
    if (!anchorSpec || !isPColumnSpec(anchorSpec)) {
      console.error('Anchor spec is undefined or is not PColumnSpec', anchorSpec);
      return undefined;
    }

    // Now load gene counts from same block as count data
    const columns = ctx.resultPool
    .getData()
    .entries.map((o) => o.obj)
    .filter(isPColumn)
    .filter((col) => {
      if (!isPColumnSpec(col.spec)) return false;
      if (col.spec.domain?.['pl7.app/blockId'] === anchorSpec.domain?.['pl7.app/blockId'] &&
        col.spec.domain?.['pl7.app/rna-seq/normalized'] === anchorSpec.domain?.['pl7.app/rna-seq/normalized']
      ){
        return col.spec
      } else {
        return undefined
      }
    });

    // change columns to filtered count columns
    return columns[0];

  })

  // Accepted input for Heatmap plot
  .output('testDEG', (ctx) => {
    // Count data
    // return the Reference of the Pcolumn selected as input dataset in Settings
    const anchorColumn = ctx.uiState?.anchorColumn;
    if (!anchorColumn) return undefined;
    // Get the specs of that selected Pcolumn
    const anchorSpec = ctx.resultPool.getSpecByRef(anchorColumn);
    if (!anchorSpec || !isPColumnSpec(anchorSpec)) {
      console.error('Anchor spec is undefined or is not PColumnSpec', anchorSpec);
      return undefined;
    }

    // Now load gene counts from same block as count data
    const columns = ctx.resultPool
    .getData()
    .entries.map((o) => o.obj)
    .filter(isPColumn)
    .filter((col) => {
      if (!isPColumnSpec(col.spec)) return false;
      if (col.spec.domain?.['pl7.app/blockId'] === anchorSpec.domain?.['pl7.app/blockId'] &&
        col.spec.domain?.['pl7.app/rna-seq/normalized'] === anchorSpec.domain?.['pl7.app/rna-seq/normalized']
      ){
        return col.spec
      } else if (// col.spec.annotations?.['pl7.app/label'].includes("log2FC")
        col.spec.name === 'pl7.app/rna-seq/DEG'
      ){
        return col.spec
      } else {
        return undefined
      }

      // // Set "pl7.app/axisNature": "heterogeneous" on gene symbol?
      // for (const col of columns) {
      //   if (col.spec.name === 'geneSymbols') {
      //     col.spec.axesSpec[1].annotations!['pl7.app/axisNature'] = 'heterogeneous';

          
      //     // for (const axis of col.spec.axesSpec) {
      //     //   if (axis.name === 'pl7.app/rna-seq/geneId') {
      //     //     axis.annotations!['pl7.app/axisNature'] = 'scaleCompatible';
      //     //   }
      //     // }
      //   }
      // }
      // Set "pl7.app/axisNature": "heterogeneous" on gene symbol?
      // for (const col of columns) {
      //   if (col.spec.name === 'pl7.app/rna-seq/countMatrix') {
      //     // col.spec.axesSpec.push(
      //     //   {
      //     //     "annotations": {
      //     //       "pl7.app/label": "Gene Symbol",
      //     //       'pl7.app/axisNature': 'scaleCompatible'
      //     //     },
      //     //     "domain": {
      //     //       "pl7.app/species": "saccharomyces-cerevisiae"
      //     //     },
      //     //     "name": "geneSymbols",
      //     //     "type": "String"
      //     //   }
      //     // )
          
          
      //     // for (const axis of col.spec.axesSpec) {
      //     //   if (axis.name === 'pl7.app/rna-seq/geneId') {
      //     //     axis.annotations!['pl7.app/axisNature'] = 'scaleCompatible';
      //     //   }
      //     // }
      //   }
      // }

    });


    // change columns to filtered count columns
    return columns
  })

  
  // Accepted input for Heatmap plot
  .output('heatmapPf', (ctx) => {
    // Count data
    // return the Reference of the Pcolumn selected as input dataset in Settings
    const anchorColumn = ctx.uiState?.anchorColumn;
    if (!anchorColumn) return undefined;
    // Get the specs of that selected Pcolumn
    const anchorSpec = ctx.resultPool.getSpecByRef(anchorColumn);
    if (!anchorSpec || !isPColumnSpec(anchorSpec)) {
      console.error('Anchor spec is undefined or is not PColumnSpec', anchorSpec);
      return undefined;
    }

    // Now load gene counts from same block as count data
    const columns = ctx.resultPool
    .getData()
    .entries.map((o) => o.obj)
    .filter(isPColumn)
    .filter((col) => {
      if (!isPColumnSpec(col.spec)) return false;
      if (col.spec.domain?.['pl7.app/blockId'] === anchorSpec.domain?.['pl7.app/blockId'] &&
        col.spec.domain?.['pl7.app/rna-seq/normalized'] === anchorSpec.domain?.['pl7.app/rna-seq/normalized']
      ){
        return col.spec
      } else if (col.spec.domain?.['pl7.app/blockId'] === anchorSpec.domain?.['pl7.app/blockId'] &&
          col.spec.annotations?.['pl7.app/label'] === 'Gene Symbol'
        ){
        return col.spec
      } else if (// col.spec.annotations?.['pl7.app/label'].includes("log2FC")
        col.spec.name === 'pl7.app/rna-seq/DEG'
      ){
        return col.spec
      } else {
        return undefined
      }
    });

    // enriching with upstream data
    const valueTypes = [
      "Int",
      "Long",
      "Float",
      "Double",
      "String",
      "Bytes",
    ] as ValueType[];
    const upstream = ctx.resultPool
      .getData()
      .entries.map((v) => v.obj)
      .filter(isPColumn)
      .filter((column) =>
        valueTypes.find((valueType) => (valueType === column.spec.valueType) && (
                                          column.id.includes("metadata"))
                                        )
      );

    // We use createPFrameForGraphs for these plots and Pcolumns that don't
    // have a blockID? (like DEG Pcolumn)
    return  createPFrameForGraphs(ctx, [...columns, ...upstream]);
  })

  /**
   * Returns true if the block is currently in "running" state
   */
  .output('isRunning', (ctx) => ctx.outputs?.getIsReadyOrError() === false)

  .sections([
    { type: 'link', href: '/', label: 'Main' },
    { type: 'link', href: '/graph', label: 'Gene Expression' },
    { type: "link", href: "/heatmap", label: "Expression Heatmap" },
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
