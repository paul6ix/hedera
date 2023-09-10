import {
    Client,
    PrivateKey,
    Hbar,
    AccountId,
    FileCreateTransaction,
    AccountBalanceQuery,
    AccountInfoQuery,
    TransferTransaction,
    ContractCreateTransaction,
    ContractFunctionParameters,
    ContractCallQuery,
    ContractExecuteTransaction,
} from "@hashgraph/sdk";
import "dotenv/config";
import * as fs from 'fs'
let client;
const operatorId  = AccountId.fromString(process.env.OPERATOR_ID_MAIN)
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY_MAIN)
client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
    operatorId,operatorKey);

async function main() {
    //Adding contract file to the network
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
//contract deployment
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

//contract call
    const contractQueryTX = new ContractCallQuery()
        .setContractId(contractID)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Paul"))
        .setMaxQueryPayment(new Hbar(1));

    const contractQuerySubmit = await contractQueryTX.execute(client);
    const contractQueryResult = await  contractQuerySubmit.getUint256(0);
    console.log(`Contract call details: ${contractQueryResult}`)

//contract write
    const contractExecuteTX = new ContractExecuteTransaction()
        .setContractId(contractID)
        .setGas(100000)
        .setFunction("setMobileNumber", new ContractFunctionParameters().addString('Arkhia').addUint256(2222))
        .setMaxTransactionFee(new Hbar(0.75))
    const contractExecuteSubmit =  await  contractExecuteTX.execute(client)
    const  contractExecuteRX = await contractExecuteSubmit.getReceipt(client)
    console.log(`Contract write successful: ${contractExecuteRX.status}`)

    const contractQueryTX1 = new ContractCallQuery()
        .setContractId(contractID)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Arkhia"))
        .setMaxQueryPayment(new Hbar(1));

    const contractQuerySubmit1 = await contractQueryTX1.execute(client);
    const contractQueryResult1 = await  contractQuerySubmit1.getUint256(0);
    console.log(`Contract call details: ${contractQueryResult1}`)



}

main()

