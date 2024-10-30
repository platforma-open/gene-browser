import { BlockModel, InferOutputsType } from '@platforma-sdk/model';

export type BlockArgs = {
  name?: string;
};

export const model = BlockModel.create<BlockArgs>()

  .initialArgs({})

  .output('message', (ctx) => ctx.outputs?.resolve('message')?.getDataAsJson())

  .sections([{ type: 'link', href: '/', label: 'Main' }])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
