import {
    Client,
    PrivateKey,
    Hbar,
    AccountId,
    FileCreateTransaction,
    AccountBalanceQuery,
    AccountInfoQuery,
    TransferTransaction, ContractCreateTransaction, ContractFunctionParameters, ContractCallQuery,
} from "@hashgraph/sdk";
import "dotenv/config";
import * as fs from 'fs'
let client;


try {
    client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
        AccountId.fromString(process.env.OPERATOR_ID_MAIN),
        PrivateKey.fromString(process.env.OPERATOR_KEY_MAIN)
    );
} catch (error) {
    throw new Error(
        "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
    );

}
async function main() {
    const contractByteCode = fs.readFileSync('lookUpContract_sol_LookupContract.bin')
    const  fileCreateTx = new  FileCreateTransaction()
        .setContents(contractByteCode)
        .setKeys([process.env.OPERATOR_KEY_MAIN])
        .setMaxTransactionFee(new Hbar(0.25))
        .freezeWith(client)
    const  fileCreateSign = await fileCreateTx.sign(process.env.OPERATOR_KEY_MAIN)
    const fileCreateSubmit = await  fileCreateSign.execute(client)
    const fileCreateRX = await fileCreateSubmit.getReceipt(client)
    const byteCodeID = fileCreateRX.fileID
    console.log(`The bytecode file ID is: ${byteCodeID}`)

    const contractInitiateTX = new ContractCreateTransaction()
        .setBytecodeFileId(byteCodeID)
        .setGas(1000)
        .setConstructorParameters(new ContractFunctionParameters().addString('Paul Okpor').addUint256(666666))
    const contractInitiateSubmit = await  contractInitiateTX.execute(client)
    const contractInitiateRX = await contractInitiateSubmit.getReceipt(client)
    const contractID = contractInitiateRX.contractID
    const contractAddress =  contractID.toSolidityAddress()
    console.log(`- The contract ID is: ${contractID}`)
    console.log(` The smart contract ID in solidity is: ${contractAddress} `)


    const contractQueryTX = new ContractCallQuery()
        .setContractId(contractID)
        .setGas(1000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Paul Okpor"))
        .setMaxQueryPayment(new Hbar(0.0000001));

    const contractQuerySubmit = await contractQueryTX.execute(client);
    const contractQueryResult = await  contractQuerySubmit.getUint256(0);
    console.log(`Contract call function details: ${contractQueryResult}`)




}

main()

