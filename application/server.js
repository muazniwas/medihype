var express = require("express"),
  app = express(),
  port = process.env.PORT || 3000;

const smartcontracts = require("./app");

app.listen(port);

console.log("medihype RESTful API server started on: " + port);

app.get("/initLedger", (req, res) => {
  smartcontracts.initLedger();
  res.json("SUCCESS!");
});

app.get("/queryPatientMedicalHistory", (req, res) => {
  smartcontracts.queryPatientMedicalHistory(req.params);
  res.json("SUCCESS!");
});

app.get("/queryPatientPrescription", (req, res) => {
  smartcontracts.queryPatientPrescription(req.params);
  res.json("SUCCESS!");
});

app.post("/createPatient", (req, res) => {
  smartcontracts.createPatient(req.body);
  res.json("SUCCESS!");
});

app.post("/addMedicalHistory", (req, res) => {
  smartcontracts.addMedicalHistory(req.body);
  res.json("SUCCESS!");
});

app.post("/addPrescription", (req, res) => {
  smartcontracts.addPrescription(req.body);
  res.json("SUCCESS!");
});

app.post("/givePersmissionMedi", (req, res) => {
  smartcontracts.givePersmissionMedi(req.body);
  res.json("SUCCESS!");
});

app.post("/givePersmissionPres", (req, res) => {
  smartcontracts.givePersmissionPres(req.body);
  res.json("SUCCESS!");
});
