const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ENCRYPTION_KEY = process.env.MYSQL_ENCRYPTION_KEY || process.env.DB_ENCRYPTION_KEY || 'dental_clinic_default_secret';
const escapedKey = sequelize.escape(ENCRYPTION_KEY);

const encryptedFields = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'dob',
  'gender',
  'address',
  'medical_notes',
];

const decryptExpression = (columnName) => sequelize.literal(
  `CAST(AES_DECRYPT(${columnName}, ${escapedKey}) AS CHAR CHARACTER SET utf8mb4)`
);

const encryptExpression = (value) => sequelize.literal(
  `AES_ENCRYPT(${sequelize.escape(value)}, ${escapedKey})`
);

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  first_name_enc: {
    type: DataTypes.BLOB,
    allowNull: false,
  },
  last_name_enc: {
    type: DataTypes.BLOB,
    allowNull: false,
  },
  email_enc: {
    type: DataTypes.BLOB,
    allowNull: true,
  },
  phone_enc: {
    type: DataTypes.BLOB,
    allowNull: true,
  },
  dob_enc: {
    type: DataTypes.BLOB,
    allowNull: true,
  },
  gender_enc: {
    type: DataTypes.BLOB,
    allowNull: true,
  },
  address_enc: {
    type: DataTypes.BLOB,
    allowNull: true,
  },
  medical_notes_enc: {
    type: DataTypes.BLOB,
    allowNull: true,
  },

  first_name: {
    type: DataTypes.VIRTUAL,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.VIRTUAL,
    allowNull: false,
  },
  email: {
    type: DataTypes.VIRTUAL,
    allowNull: true,
  },
  phone: {
    type: DataTypes.VIRTUAL,
    allowNull: true,
  },
  dob: {
    type: DataTypes.VIRTUAL,
    allowNull: true,
  },
  gender: {
    type: DataTypes.VIRTUAL,
    allowNull: true,
  },
  address: {
    type: DataTypes.VIRTUAL,
    allowNull: true,
  },
  medical_notes: {
    type: DataTypes.VIRTUAL,
    allowNull: true,
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  defaultScope: {
    attributes: {
      include: [
        [decryptExpression('first_name_enc'), 'first_name'],
        [decryptExpression('last_name_enc'), 'last_name'],
        [decryptExpression('email_enc'), 'email'],
        [decryptExpression('phone_enc'), 'phone'],
        [decryptExpression('dob_enc'), 'dob'],
        [decryptExpression('gender_enc'), 'gender'],
        [decryptExpression('address_enc'), 'address'],
        [decryptExpression('medical_notes_enc'), 'medical_notes'],
      ],
      exclude: [
        'first_name_enc',
        'last_name_enc',
        'email_enc',
        'phone_enc',
        'dob_enc',
        'gender_enc',
        'address_enc',
        'medical_notes_enc',
      ],
    },
  },
});

const encryptPatientFields = (patient) => {
  encryptedFields.forEach((field) => {
    const value = patient.getDataValue(field);
    const columnName = `${field}_enc`;

    if (value === undefined) {
      return;
    }

    if (value === null) {
      patient.setDataValue(columnName, null);
      return;
    }

    patient.setDataValue(columnName, encryptExpression(value));
  });
};

Patient.beforeSave((patient) => {
  encryptPatientFields(patient);
});

module.exports = Patient;
