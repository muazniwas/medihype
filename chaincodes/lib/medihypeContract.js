"use strict";

const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

class medihypeContract extends Contract {
  //Initialize ledger
  async initLedger(ctx) {
    console.info("============= START : Initialize Ledger ===========");
    const patients = [
      {
        patientId: "0001",
        name: "John D. Sundquist",
        SSN: "118-90-1234",
        gender: "male",
        address: "1512 Garrett Street, Grand Rapids, MI",
        phone: "269-232-2965",
        dob: "20.02.1976",
        age: "44 years",
        medical_history: {
          data: {},
          permissions: [],
        },
        prescriptions: {
          data: {},
          permissions: [],
        },
      },
    ];

    const serialKeyMed = uuidv4();
    const serialKeyPres = uuidv4();
    const patientKeyPair = crypto.getDiffieHellman("modp14");

    patientKeyPair.generateKeys();

    const patientPublicKey = patientKeyPair.getPublicKey();
    const patientPrivateKey = patientKeyPair.getPrivateKey();

    const medPermission = crypto.publicEncrypt(patientPublicKey, serialKeyMed);
    const presPermission = crypto.publicEncrypt(
      patientPublicKey,
      serialKeyPres
    );

    patient.medical_history.permissions.push({
      pubkey: patientPublicKey,
      serialKey: medPermission,
    });

    patient.prescriptions.permissions.push({
      pubkey: patientPublicKey,
      serialKey: presPermission,
    });

    for (let i = 0; i < patients.length; i++) {
      patients[i].docType = "patient";
      await ctx.stub.putState(
        "PATIENT" + i,
        Buffer.from(JSON.stringify(patients[i]))
      );
      console.info("Added <--> ", patients[i]);
    }
    console.info("============= END : Initialize Ledger ===========");
    return patientPrivateKey;
  }

  //Read patient medical history
  async queryPatientMedicalHistory(ctx, patientId, reqPubKey) {
    const patientAsBytes = await ctx.stub.getState(patientId); // get the patient from chaincode state
    if (!patientAsBytes || patientAsBytes.length === 0) {
      throw new Error(`${patientId} does not exist`);
    }
    const patient = JSON.parse(patientAsBytes.toString());
    const permissions = patient.medical_history.permissions;

    let hasPermission = permissions.findIndex((i) => i.pubkey === reqPubKey);

    if (hasPermission === -1) {
      console.log("Requester doesn't has permission to view patient data");
      return;
    } else {
      console.log(patientAsBytes.toString());
      return patient.medical_history;
    }
  }

  //Read patient prescriptions
  async queryPatientPrescription(ctx, patientId, reqPubKey) {
    const patientAsBytes = await ctx.stub.getState(patientId); // get the patient from chaincode state
    if (!patientAsBytes || patientAsBytes.length === 0) {
      throw new Error(`${patientId} does not exist`);
    }
    const patientAsObject = JSON.parse(patientAsBytes.toString());
    const permissions = patientAsObject.prescriptions.permissions;

    let hasPermission = permissions.findIndex((i) => i.pubkey === reqPubKey);

    if (hasPermission === -1) {
      console.log("Requester doesn't has permission to view patient data");
      return;
    } else {
      console.log(patientAsBytes.toString());
      return patientAsBytes.toString();
    }
  }

  //Create patient
  async createPatient(
    ctx,
    patientId,
    name,
    SSN,
    gender,
    address,
    phone,
    dob,
    age
  ) {
    console.info("============= START : Add Patient ===========");

    const serialKeyMed = uuidv4();
    const serialKeyPres = uuidv4();
    const patientKeyPair = crypto.getDiffieHellman("modp14");

    patientKeyPair.generateKeys();

    const patientPublicKey = patientKeyPair.getPublicKey();
    const patientPrivateKey = patientKeyPair.getPrivateKey();

    const medPermission = crypto.publicEncrypt(patientPublicKey, serialKeyMed);
    const presPermission = crypto.publicEncrypt(
      patientPublicKey,
      serialKeyPres
    );

    const patient = {
      patientId,
      docType: "patient",
      name,
      SSN,
      gender,
      address,
      phone,
      dob,
      age,
      medical_history: {
        data: null,
        permissions: [
          {
            pubkey: patientPublicKey,
            serialKey: medPermission,
          },
        ],
      },
      prescriptions: {
        data: null,
        permissions: [
          {
            pubkey: patientPublicKey,
            serialKey: presPermission,
          },
        ],
      },
    };

    await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));
    console.info("============= END : Add Patient ===========");
    return patientPrivateKey;
  }

  //Add medical history
  async addMedicalHistory(ctx, patientId, reqPubKey, mediData) {
    console.info("============= START : addMedicalHistory ===========");

    const patientAsBytes = await ctx.stub.getState(patientId); // get the patient from chaincode state
    if (!patientAsBytes || patientAsBytes.length === 0) {
      throw new Error(`${patientId} does not exist`);
    }
    const patient = JSON.parse(patientAsBytes.toString());
    const permissions = patientAsObject.medical_history.permissions;

    let hasPermission = permissions.findIndex((i) => i.pubkey === reqPubKey);

    if (hasPermission === -1) {
      console.log("Requester doesn't has permission to write patient data");
      return;
    } else {
      patient.medical_history.data = mediData;

      await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));
      console.info("============= END : addMedicalHistory ===========");
    }
  }

  //Add prescription
  async addPrescription(ctx, patientId, reqPubKey, prescription) {
    console.info("============= START : addPrescription ===========");

    const patientAsBytes = await ctx.stub.getState(patientId); // get the patient from chaincode state
    if (!patientAsBytes || patientAsBytes.length === 0) {
      throw new Error(`${patientId} does not exist`);
    }
    const patient = JSON.parse(patientAsBytes.toString());
    const permissions = patientAsObject.prescriptions.permissions;

    let hasPermission = permissions.findIndex((i) => i.pubkey === reqPubKey);

    if (hasPermission === -1) {
      console.log("Requester doesn't has permission to write prescriptions");
      return;
    } else {
      patient.prescriptions.data = prescription;

      await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));
      console.info("============= END : addPrescription ===========");
    }
  }

  //Give permission for medical history
  async givePersmissionMedi(ctx, patientId, reqPubKey, encryptedKey) {
    console.info("============= START : givePermissionMedi ===========");

    const patientAsBytes = await ctx.stub.getState(patientId); // get the patient from chaincode state
    if (!patientAsBytes || patientAsBytes.length === 0) {
      throw new Error(`${patientId} does not exist`);
    }

    const patient = JSON.parse(patientAsBytes.toString());
    patient.medical_history.permissions.push({
      pubkey: reqPubKey,
      serialKey: encryptedKey,
    });

    await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));

    console.info("============= END : givePermissionMedi ===========");
  }

  //Give permission for prescriptions
  async givePersmissionPres(ctx, patientId, reqPubKey, encryptedKey) {
    console.info("============= START : givePermissionMedi ===========");

    const patientAsBytes = await ctx.stub.getState(patientId); // get the patient from chaincode state
    if (!patientAsBytes || patientAsBytes.length === 0) {
      throw new Error(`${patientId} does not exist`);
    }

    const patient = JSON.parse(patientAsBytes.toString());
    patient.prescriptions.permissions.push({
      pubkey: reqPubKey,
      serialKey: encryptedKey,
    });

    await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));

    console.info("============= END : givePermissionMedi ===========");
  }

  // async queryAllPatients(ctx) {
  //   const startKey = "";
  //   const endKey = "";
  //   const allResults = [];
  //   for await (const { key, value } of ctx.stub.getStateByRange(
  //     startKey,
  //     endKey
  //   )) {
  //     const strValue = Buffer.from(value).toString("utf8");
  //     let record;
  //     try {
  //       record = JSON.parse(strValue);
  //     } catch (err) {
  //       console.log(err);
  //       record = strValue;
  //     }
  //     allResults.push({ Key: key, Record: record });
  //   }
  //   console.info(allResults);
  //   return JSON.stringify(allResults);
  // }
}

module.exports = medihypeContract;
