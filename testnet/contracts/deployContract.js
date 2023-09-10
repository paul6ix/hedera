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
const operatorId  = AccountId.fromString(process.env.OPERATOR_ID_MAIN)
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY_MAIN)
client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
    operatorId,operatorKey);

async function main() {
    const contractByteCode = fs.readFileSync('testnet/contracts/lookUpContract_sol_LookupContract.bin')
    const  fileCreateTx = new  FileCreateTransaction()
        .setContents(contractByteCode)
        .setKeys([operatorKey])
        .setMaxTransactionFee(new Hbar(10000))
        .freezeWith(client)
    const  fileCreateSign = await fileCreateTx.sign(operatorKey)
    const fileCreateSubmit = await  fileCreateSign.execute(client)
    const fileCreateRX = await fileCreateSubmit.getReceipt(client)
    const byteCodeID = fileCreateRX.fileId
    console.log(`The bytecode file ID is: ${byteCodeID}`)

    const contractInitiateTX = new ContractCreateTransaction()
        .setBytecodeFileId(byteCodeID)
        .setGas(100000)
        .setConstructorParameters(new ContractFunctionParameters().addString('Paul').addUint256(111))
    const contractInitiateSubmit = await  contractInitiateTX.execute(client)
    const contractInitiateRX = await contractInitiateSubmit.getReceipt(client)
    const contractID = contractInitiateRX.contractId
    const contractAddress =  contractID.toSolidityAddress()
    console.log(`- The contract ID is: ${contractID}`)
    console.log(` The smart contract ID in solidity is: ${contractAddress} `)


    const contractQueryTX = new ContractCallQuery()
        .setContractId(contractID)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Paul"))
        .setMaxQueryPayment(new Hbar(1));

    const contractQuerySubmit = await contractQueryTX.execute(client);
    const contractQueryResult = await  contractQuerySubmit.getUint256(0);
    console.log(`Contract call function details: ${contractQueryResult}`)




}

main()

