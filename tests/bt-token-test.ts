import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BtToken } from "../target/types/bt_token";
import { PublicKey } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import { assert } from "chai";

const STATE_SEED = Buffer.from("bt_state");
const VAULT_SEED = Buffer.from("bt_vault");
const BT_DECIMALS = 6;

describe("bt-token-tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BtToken as Program<BtToken>;
  const authority = provider.wallet as anchor.Wallet;

  let btMint: PublicKey;
  let usdcMint: PublicKey;
  let statePda: PublicKey;
  let vaultPda: PublicKey;

  before(async () => {
    [statePda] = PublicKey.findProgramAddressSync(
      [STATE_SEED],
      program.programId
    );
    [vaultPda] = PublicKey.findProgramAddressSync(
      [VAULT_SEED],
      program.programId
    );

    usdcMint = await createMint(
      provider.connection,
      authority.payer,
      authority.publicKey,
      null,
      6
    );

    // BT mint authority must be the state PDA
    btMint = await createMint(
      provider.connection,
      authority.payer,
      statePda,
      null,
      BT_DECIMALS
    );
  });

  it("initialize: sets up state correctly", async () => {
    // state, vault, tokenProgram, systemProgram, rent are auto-resolved by Anchor
    await program.methods
      .initialize(BT_DECIMALS)
      .accounts({
        authority: authority.publicKey,
        btMint,
        usdcMint,
      })
      .rpc();

    const state = await program.account.state.fetch(statePda);

    assert.ok(state.btMint.equals(btMint), "bt_mint mismatch");
    assert.ok(state.usdcMint.equals(usdcMint), "usdc_mint mismatch");
    assert.ok(state.vault.equals(vaultPda), "vault mismatch");
    assert.equal(state.corpus.toNumber(), 0, "corpus should start at 0");
    assert.equal(state.totalBtMinted.toNumber(), 0, "totalBtMinted should start at 0");
    assert.equal(state.btDecimals, BT_DECIMALS, "bt_decimals mismatch");
  });

  it("initialize: cannot be called twice", async () => {
    try {
      await program.methods
        .initialize(BT_DECIMALS)
        .accounts({
          authority: authority.publicKey,
          btMint,
          usdcMint,
        })
        .rpc();
      assert.fail("second initialize should have failed");
    } catch (err) {
      assert.ok(err, "expected an error on double-init");
    }
  });
});
