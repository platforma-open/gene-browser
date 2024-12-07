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

  .output('datasetSpec', (ctx) => {
    if (ctx.args.countsRef) return ctx.resultPool.getSpecByRef(ctx.args.countsRef);
    else return undefined;
  })

  .output('pt', (ctx) => {
    const pCols = ctx.outputs?.resolve('normPf')?.getPColumns();
    if (pCols === undefined) {
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

    return createPlDataTable(ctx, pCols, ctx.uiState?.tableState);
  })

  .output('pts', (ctx) => {
    const pCols = ctx.outputs?.resolve('normPf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    // for the table purposes, we set "pl7.app/axisNature": "heterogeneous" on sample axis
    for (const col of pCols) {
      for (const axis of col.spec.axesSpec) {
        if (axis.name === 'pl7.app/sampleId') {
          axis.annotations!['pl7.app/axisNature'] = 'heterogeneous';
        }
      }
    }
    return pCols?.map(p => p.spec);
  })

  .output('normPf', (ctx): PFrameHandle | undefined => {
    const pCols = ctx.outputs?.resolve('normPf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    // enriching with upstream data
    const valueTypes = ['Int', 'Float', 'Double', 'String'] as ValueType[];
    const upstream = ctx.resultPool
      .getData()
      .entries.map((v) => v.obj)
      .filter(isPColumn)
      .filter((column) => valueTypes.find((valueType) => valueType === column.spec.valueType));

    return ctx.createPFrame([...pCols, ...upstream]);
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
