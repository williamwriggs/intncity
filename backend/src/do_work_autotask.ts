import { doWorkLoop, getContextFromSecrets } from "./distribution";
import { RelayerParams } from "defender-relay-client/lib/relayer";
import { DefenderRelaySigner, DefenderRelayProvider } from "defender-relay-client/lib/ethers";
import { AutotaskEvent } from "defender-autotask-utils";

// Entrypoint for the Autotask
export async function handler(event: RelayerParams & AutotaskEvent) {
  const provider = new DefenderRelayProvider(event);
  const signer = new DefenderRelaySigner(event, provider, { speed: "fast" });
  if (!event.secrets) {
    throw new Error("missing secrets in event");
  }
  const context = getContextFromSecrets(event.secrets);

  await doWorkLoop(context, signer, provider);
  console.log("success!");
}
