import { GraphMakerSettings } from '@milaboratories/graph-maker';
import { 
  BlockModel, 
  InferOutputsType,
  isPColumn,
  createPlDataTable,
  PlDataTableState,
  Ref,
  ValueType,
  isPColumnSpec,
  PFrameHandle
} from '@platforma-sdk/model';

export type UiState = {
  tableState?: PlDataTableState;
  graphState?: GraphMakerSettings;
};

export type BlockArgs = {
  countsRef?: Ref;
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({})

  .withUiState<UiState>({})

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

    return createPlDataTable(ctx, pCols, ctx.uiState?.tableState);
  })


  .output('ColumnId', (ctx) => {
    const pCols = ctx.outputs?.resolve('normPf')?.getPColumns();
    if (pCols?.length !== 1) {
      throw Error('expected single column');
    }

    return pCols[0].id;
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

  .sections([
    { type: 'link', href: '/', label: 'Main' },
    { type: 'link', href: '/graph', label: 'Graph' }
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
