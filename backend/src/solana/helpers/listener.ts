import { createSolanaRpc, createSolanaRpcSubscriptions, getBase58Codec, type Address, type Signature } from "@solana/kit";
import { ZKEK_PROGRAM_ADDRESS, getDepositEventDecoder, type DepositEvent } from "../generated";

const DEPOSIT_EVENT_DISCRIMINATOR = new Uint8Array([120, 248, 61, 83, 31, 142, 107, 144]);

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export async function getDepositEventFromTransaction(
  rpcUrl: string,
  signature: string,
  programAddress: string = ZKEK_PROGRAM_ADDRESS,
): Promise<DepositEvent | null> {
  const rpc = createSolanaRpc(rpcUrl);

  const response = await rpc
    .getTransaction(signature as Signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
      encoding: "json",
    })
    .send();

  if (!response || !response.meta?.innerInstructions) {
    return null;
  }

  const accountKeys = response.transaction.message.accountKeys;

  for (const innerIxs of response.meta.innerInstructions) {
    for (const innerIx of innerIxs.instructions) {
      const ixProgramId = accountKeys[innerIx.programIdIndex];
      if (ixProgramId !== programAddress) {
        continue;
      }

      const decodedData = getBase58Codec().encode(innerIx.data);

      // emit_cpi! uses a nested structure:
      // - 8 bytes: Anchor __cpi instruction discriminator (sha256("anchor:event")[0..8])
      // - 8 bytes: Event discriminator
      // - N bytes: Event data
      if (decodedData.length < 16) {
        continue;
      }

      const eventDiscriminator = decodedData.slice(8, 16);
      if (!arraysEqual(eventDiscriminator, DEPOSIT_EVENT_DISCRIMINATOR)) {
        continue;
      }

      const eventData = decodedData.slice(16);
      return getDepositEventDecoder().decode(eventData);
    }
  }

  return null;
}

export async function startDepositEventListener(rpcUrl: string, wsUrl: string, programAddress: string = ZKEK_PROGRAM_ADDRESS): Promise<void> {
  const rpcSubscriptions = createSolanaRpcSubscriptions(wsUrl);
  const abortController = new AbortController();

  console.log(`Starting deposit event listener for program: ${programAddress}`);

  const logsNotifications = await rpcSubscriptions
    .logsNotifications({ mentions: [programAddress as Address] }, { commitment: "confirmed" })
    .subscribe({ abortSignal: abortController.signal });

  for await (const notification of logsNotifications) {
    const signature = notification.value.signature as string;

    try {
      const event = await getDepositEventFromTransaction(rpcUrl, signature, programAddress);
      if (event) {
        console.log(`NewRoot: ${Buffer.from(event.newRoot).toString("hex")}`);
      }
    } catch (error) {
      console.error(`Error processing transaction ${signature}:`, error);
    }
  }
}
