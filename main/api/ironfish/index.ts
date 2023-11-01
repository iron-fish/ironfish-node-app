import { manager } from "../manager";
import { t } from "../trpc";

export const ironfishRouter = t.router({
  getPeers: t.procedure.query(async () => {
    const ironfish = await manager.getIronfish();
    const rpcClient = await ironfish.rpcClient();
    const peerResponse = await rpcClient.peer.getPeers();
    return peerResponse.content.peers;
  }),
  getStatus: t.procedure.query(async () => {
    const ironfish = await manager.getIronfish();
    const rpcClient = await ironfish.rpcClient();
    const peerResponse = await rpcClient.node.getStatus();
    return peerResponse.content;
  }),
  getInitialState: t.procedure.query(async () => {
    return manager.getInitialState();
  }),
  startNode: t.procedure.mutation(async () => {
    const ironfish = await manager.getIronfish();
    ironfish.start();
  }),
});
