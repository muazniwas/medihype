"use strict";

const { Gateway, Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const path = require("path");
const {
  buildCAClient,
  registerAndEnrollUser,
  enrollAdmin,
} = require("./CAUtil.js");
const { buildCCPOrg1, buildWallet } = require("./AppUtil.js");

const channelName = "healthchannel";
const chaincodeName = "medihypeContract";
const mspOrg1 = "HealthMinistryMSP";
const walletPath = path.join(__dirname, "wallet");
const org1UserId = "appUser";

function prettyJSONString(inputString) {
  return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function getChaincode() {
  // build an in memory object with the network configuration (also known as a connection profile)
  const ccp = buildCCPOrg1();

  // build an instance of the fabric ca services client based on
  // the information in the network configuration
  const caClient = buildCAClient(FabricCAServices, ccp, "ca.nephos.local");

  // setup the wallet to hold the credentials of the application user
  const wallet = await buildWallet(Wallets, walletPath);

  // in a real application this would be done on an administrative flow, and only once
  await enrollAdmin(caClient, wallet, mspOrg1);

  // in a real application this would be done only when a new user was required to be added
  // and would be part of an administrative flow
  await registerAndEnrollUser(
    caClient,
    wallet,
    mspOrg1,
    org1UserId,
    "org1.department1"
  );

  // Create a new gateway instance for interacting with the fabric network.
  // In a real application this would be done as the backend server session is setup for
  // a user that has been verified.
  const gateway = new Gateway();

  try {
    // setup the gateway instance
    // The user will now be able to create connections to the fabric network and be able to
    // submit transactions and query. All transactions submitted by this gateway will be
    // signed by this user using the credentials stored in the wallet.
    await gateway.connect(ccp, {
      wallet,
      identity: org1UserId,
      discovery: { enabled: true, asLocalhost: true }, // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(channelName);

    // Get the contract from the network.
    const contract = network.getContract(chaincodeName);

    return contract;
  } catch (error) {
    console.error(`******** FAILED to run the application: ${error}`);
  }
}

async function initLedger() {
  const contract = await getChaincode();
  console.log(
    "\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger"
  );
  await contract.submitTransaction("initLedger");
  console.log("*** Result: committed");
}

async function queryPatientMedicalHistory({ patientId, reqPubKey }) {
  const contract = await getChaincode();

  await contract.evaluateTransaction(
    "queryPatientMedicalHistory",
    "patientId",
    "reqPubKey"
  );
  console.log("*** Result: committed");
}

async function queryPatientPrescription({ patientId, reqPubKey }) {
  const contract = await getChaincode();

  await contract.evaluateTransaction(
    "queryPatientPrescription",
    "patientId",
    "reqPubKey"
  );
  console.log("*** Result: committed");
}

async function createPatient({
  patientId,
  name,
  SSN,
  gender,
  address,
  phone,
  dob,
  age,
}) {
  await contract.submitTransaction(
    "createPatient",
    "patientId",
    "name",
    "SSN",
    "gender",
    "address",
    "phone",
    "dob",
    "age"
  );
  console.log("*** Result: committed");
}

async function addMedicalHistory({ patientId, reqPubKey, mediData }) {
  await contract.submitTransaction(
    "addMedicalHistory",
    "patientId",
    "reqPubKey",
    "mediData"
  );
  console.log("*** Result: committed");
}

async function addPrescription({ patientId, reqPubKey, prescription }) {
  await contract.submitTransaction(
    "addPrescription",
    "patientId",
    "reqPubKey",
    "prescription"
  );
  console.log("*** Result: committed");
}

async function givePersmissionMedi({ patientId, reqPubKey, encryptedKey }) {
  await contract.submitTransaction(
    "givePersmissionMedi",
    "patientId",
    "reqPubKey",
    "encryptedKey"
  );
  console.log("*** Result: committed");
}

async function givePersmissionPres({ patientId, reqPubKey, encryptedKey }) {
  await contract.submitTransaction(
    "givePersmissionPres",
    "patientId",
    "reqPubKey",
    "encryptedKey"
  );
  console.log("*** Result: committed");
}
