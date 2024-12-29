const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    // Section 1: Company Info
    raisonSociale: {
      type: String,
      required: true,
      trim: true,
    },
    sigle: {
      type: String,
      trim: true,
    },
    numeroCC: {
      type: String,
      trim: true,
    },
    dateDebutExerciceComptable: {
      type: String,
      trim: true,
    },
    dateFinExerciceComptable: {
      type: String,
      trim: true,
    },
    dateDebutActivite: {
      type: Date,
    },
    dateArreteEffectif: {
      type: Date,
    },

    // Section 2: Activity Info
    activitePrincipale: {
      type: String,
      trim: true,
    },
    activiteSecondaire: {
      type: String,
      trim: true,
    },
    activiteTertiaire: {
      type: String,
      trim: true,
    },
    codeActivitePrincipale: {
      type: String,
      trim: true,
    },
    codeActiviteSecondaire: {
      type: String,
      trim: true,
    },
    nombreEmployes: {
      type: Number,
      default: 0,
    },
    engagementRetraite: {
      type: String,
      trim: true,
    },

    // Section 3: Tax Info
    natureImpots: {
      type: String,
      trim: true,
    },
    tauxIMF: {
      type: Number,
      default: 0,
    },
    minimumPerception: {
      type: Number,
      default: 0,
    },
    tauxAbattementIBIC: {
      type: Number,
      default: 0,
    },
    regimeImposition: {
      type: String,
      trim: true,
    },

    // Section 4: Contact Info
    paysSiegeSocial: {
      type: String,
      trim: true,
    },
    ville: {
      type: String,
      trim: true,
    },
    commune: {
      type: String,
      trim: true,
    },
    telephoneEntite: {
      type: String,
      trim: true,
    },
    emailEntite: {
      type: String,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    nomPrenomsSignataire: {
      type: String,
      trim: true,
    },
    contactSignataire: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
