import { GraphMakerState } from '@milaboratories/graph-maker';
import {
  BlockModel,
  createPlDataTable,
  InferOutputsType,
  isPColumn,
  isPColumnSpec,
  PFrameHandle,
  PlDataTableState,
  PlRef,
  ValueType
} from '@platforma-sdk/model';

export type UiState = {
  tableState: PlDataTableState;
  graphState: GraphMakerState;
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
    }
  })

  .output('countsOptions', (ctx) =>
    ctx.resultPool.getOptions((spec) => isPColumnSpec(spec) && spec.name === 'countMatrix')
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

    // for the table purposes, we set "pl7.app/axisNature": "heterogeneous" on sample axis
    // for (const col of pCols) {
    //   for (const axis of col.spec.axesSpec) {
    //     if (axis.name === 'pl7.app/sampleId') {
    //       axis.annotations!['pl7.app/axisNature'] = 'heterogeneous';
    //     }
    //   }
    // }

    const columns = ctx.resultPool
    .getData()
    .entries.map((o) => o.obj)
    .filter(isPColumn)
    .filter((col) => {
      if (!isPColumnSpec(col.spec)) return false;

      // Include count data if matches user input blockID and normlization stage
     if(col.spec.domain?.['pl7.app/blockId'] === anchorSpec.domain?.['pl7.app/blockId'] &&
      col.spec.annotations?.['pl7.app/rna-seq/normalized'] === anchorSpec.annotations?.['pl7.app/rna-seq/normalized']
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

  // .output('pts', (ctx) => {
  //   const pCols = ctx.outputs?.resolve('normPf')?.getPColumns();
  //   if (pCols === undefined) {
  //     return undefined;
  //   }

  //   // for the table purposes, we set "pl7.app/axisNature": "heterogeneous" on sample axis
  //   // for (const col of pCols) {
  //   //   for (const axis of col.spec.axesSpec) {
  //   //     if (axis.name === 'pl7.app/sampleId') {
  //   //       axis.annotations!['pl7.app/axisNature'] = 'heterogeneous';
  //   //     }
  //   //   }
  //   // }
  //   return pCols?.map(p => p.spec);
  // })

  // .output('normPf', (ctx): PFrameHandle | undefined => {
  //   const pCols = ctx.outputs?.resolve('normPf')?.getPColumns();
  //   if (pCols === undefined) {
  //     return undefined;
  //   }

  //   // enriching with upstream data
  //   const valueTypes = ['Int', 'Float', 'Double', 'String'] as ValueType[];
  //   const upstream = ctx.resultPool
  //     .getData()
  //     .entries.map((v) => v.obj)
  //     .filter(isPColumn)
  //     .filter((column) => valueTypes.find((valueType) => valueType === column.spec.valueType));

  //   return ctx.createPFrame([...pCols, ...upstream]);
  // })

  .output('plotPf', (ctx): PFrameHandle | undefined => {
    const anchorColumn = ctx.uiState?.anchorColumn;
    if (!anchorColumn) return undefined;

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
      col.spec.annotations?.['pl7.app/rna-seq/normalized'] === anchorSpec.annotations?.['pl7.app/rna-seq/normalized']
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


  /**
   * Returns true if the block is currently in "running" state
   */
  .output('isRunning', (ctx) => ctx.outputs?.getIsReadyOrError() === false)

  .sections([
    { type: 'link', href: '/', label: 'Main' },
    { type: 'link', href: '/graph', label: 'Graph' }
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
