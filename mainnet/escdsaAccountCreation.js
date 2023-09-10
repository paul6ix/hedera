import {
    Client,
    PrivateKey,
    Hbar,
    AccountId,
    AccountBalanceQuery,
    AccountInfoQuery,
    TransferTransaction,
} from "@hashgraph/sdk";

import "dotenv/config";

async function main() {
    let client;


    try {
        // Defaults the operator account ID and key such that all generated transactions will be paid for
        // by this account and be signed by this key
        console.log(process.env.HEDERA_NETWORK)
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID_MAIN),
            PrivateKey.fromString(process.env.OPERATOR_KEY_MAIN)
        );
    } catch (error) {
      console.log(error);
    }


    console.log('"Creating" a new account');

    const privateKey = PrivateKey.generateECDSA();
    const publicKey = privateKey.publicKey;

    // Assuming that the target shard and realm are known.
    // For now they are virtually always 0 and 0.
    const aliasAccountId = publicKey.toAccountId(0, 0);

    /*
     * Note that no queries or transactions have taken place yet.
     * This account "creation" process is entirely local.
     */

    console.log("Transferring some Hbar to the new account");
    const response = await new TransferTransaction()
        .addHbarTransfer(client.operatorAccountId, new Hbar(10).negated())
        .addHbarTransfer(aliasAccountId, new Hbar(10))
        .execute(client);
    await response.getReceipt(client);

    const balance = await new AccountBalanceQuery()
        .setAccountId(aliasAccountId)
        .execute(client);

    console.log(`Balances of the new account: ${balance.toString()}`);

    const info = await new AccountInfoQuery()
        .setAccountId(aliasAccountId)
        .execute(client);

    /*
     * Note that once an account exists in the ledger, it is assigned a normal AccountId, which can be retrieved
     * via an AccountInfoQuery.
     *
     * Users may continue to refer to the account by its aliasKey AccountId, but they may also
     * now refer to it by its normal AccountId
     */

    console.log(`The normal account ID: ${info.accountId.toString()}`);
    console.log(`The aliased account ID: 0.0.${info.aliasKey.toString()}`);
    console.log(`The private key (use this in sdk/Hedera native wallets): ${privateKey.toString()}`);
    console.log(`The raw private key (use this for JSON RPC wallet import): ${privateKey.toStringRaw()}`);

    console.log("Example complete!");
    client.close();
}

void main();