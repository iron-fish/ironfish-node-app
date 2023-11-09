import { z } from "zod";

import { manager } from "../manager";
import { t } from "../trpc";

const handleGetConfigInput = z
  .object({
    name: z.string().optional(),
    user: z.boolean().optional(),
  })
  .optional();

const handleSetConfigInput = z.object({
  name: z.string(),
  value: z.any(),
  // Whether to restart the node after updating the config.
  // Not all config values are picked up without a restart, so defaults to true.
  restartAfterSet: z.boolean().default(true),
});

export const ironfishRouter = t.router({
  getConfig: t.procedure.input(handleGetConfigInput).query(async (opts) => {
    const ironfish = await manager.getIronfish();
    const rpcClient = await ironfish.rpcClient();
    const response = await rpcClient.config.getConfig({
      name: opts.input?.name,
      user: opts.input?.user,
    });
    return response.content;
  }),
  setConfig: t.procedure.input(handleSetConfigInput).mutation(async (opts) => {
    const ironfish = await manager.getIronfish();
    const rpcClient = await ironfish.rpcClient();
    const response = await rpcClient.config.setConfig({
      name: opts.input.name,
      value: opts.input.value,
    });
    if (opts.input.restartAfterSet) {
      await ironfish.restart();
    }
    return response.content;
  }),
  getPeers: t.procedure.query(async () => {
    const ironfish = await manager.getIronfish();
    const rpcClient = await ironfish.rpcClient();
    const response = await rpcClient.peer.getPeers();
    return response.content.peers;
  }),
  getStatus: t.procedure.query(async () => {
    const ironfish = await manager.getIronfish();
    const rpcClient = await ironfish.rpcClient();
    const response = await rpcClient.node.getStatus();
    return response.content;
  }),
  getInitialState: t.procedure.query(async () => {
    return manager.getInitialState();
  }),
  resetNode: t.procedure.mutation(async () => {
    const ironfish = await manager.getIronfish();
    await ironfish.reset();
  }),
  startNode: t.procedure.mutation(async () => {
    const ironfish = await manager.getIronfish();
    await ironfish.start();
  }),
});
