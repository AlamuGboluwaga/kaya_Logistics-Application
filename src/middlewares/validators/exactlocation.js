const { body, check } = require("express-validator");
const { pool } = require("../../config/server");

exports.LOCATIONS = [
  body("state").isString().notEmpty().trim().toLowerCase(),

  body("exactLocations")
    .isLength({
      min: 1,
    })
    .isArray(),
];

exports.REMOVE_LOCATION = [
  body("location").isString().trim().toLowerCase().notEmpty(),
  check("locationid").custom(async (_, { req }) => {
    const checkLocationId = await pool.query(
      "SELECT * FROM tbl_kp_exact_locations WHERE id = $1",
      [req.headers.locationid]
    );
    if (checkLocationId.rowCount <= 0) {
      throw new Error("record not found");
    }
    req.locationInfo = checkLocationId.rows[0];
  }),
];

exports.LOCATION_PER_STATE = [
  check("query").custom(async (_, { req }) => {
    const state = req.query.location;
    const checkLocationsByState = await pool.query(
      "SELECT * FROM tbl_kp_exact_locations WHERE state = $1 ",
      [state]
    );
    if (checkLocationsByState.rowCount <= 0) {
      req.assignedStateLocations = []
    }
    else {
      req.assignedStateLocations = checkLocationsByState.rows[0];
    }
  }),
];

exports.REGIONAL_STATES = [
  {
    name: "Abia",
    capital: "Umuahia",
    flag: "",
  },
  {
    name: "Adamawa",
    capital: "Yola",
    flag: "",
  },
  {
    name: "Akwa-Ibom",
    capital: "Uyo",
    flag: "",
  },
  {
    name: "Anambra",
    capital: "Akwa",
    flag: "",
  },
  {
    name: "Bauchi",
    capital: "Bauchi",
    flag: "",
  },
  {
    name: "Bayelsa",
    capital: "Yenagoa",
    flag: "",
  },
  {
    name: "Benue",
    capital: "Makurdi",
    flag: "",
  },
  {
    name: "Borno",
    capital: "Maiduguri",
    flag: "",
  },
  {
    name: "Cross River",
    capital: "Calabar",
    flag: "",
  },
  {
    name: "Delta",
    capital: "Asaba",
    flag: "",
  },
  {
    name: "Ebonyi",
    capital: "Abakaliki",
    flag: "",
  },
  {
    name: "Edo",
    capital: "Benin",
    flag: "",
  },
  {
    name: "Ekiti",
    capital: "Ado-Ekiti",
    flag: "",
  },
  {
    name: "Enugu",
    capital: "Enugu",
    flag: "",
  },
  {
    name: "Gombe",
    capital: "Gombe",
    flag: "",
  },
  {
    name: "Imo",
    capital: "Owerri",
    flag: "",
  },
  {
    name: "Jigawa",
    capital: "Dutse",
    flag: "",
  },
  {
    name: "Kaduna",
    capital: "Kaduna",
    flag: "",
  },
  {
    name: "Kano",
    capital: "Kano",
    flag: "",
  },
  {
    name: "Katsina",
    capital: "Katstina",
    flag: "",
  },
  {
    name: "Kebbi",
    capital: "Birnin-Kebbi",
    flag: "",
  },
  {
    name: "Kogi",
    capital: "Lokoja",
    flag: "",
  },
  {
    name: "Kwara",
    capital: "Ilorin",
    flag: "",
  },
  {
    name: "Lagos",
    capital: "Ikeja",
    flag: "",
  },
  {
    name: "Nasarawa",
    capital: "Lafia",
    flag: "",
  },
  {
    name: "Niger",
    capital: "Minna",
    flag: "",
  },
  {
    name: "Ogun",
    capital: "Abeokuta",
    flag: "",
  },
  {
    name: "Ondo",
    capital: "Akure",
    flag: "",
  },
  {
    name: "Osun",
    capital: "Oshogbo",
    flag: "",
  },
  {
    name: "Oyo",
    capital: "Ibadan",
    flag: "",
  },
  {
    name: "Plateau",
    capital: "Jos",
    flag: "",
  },
  {
    name: "Rivers",
    capital: "Port-harcourt",
    flag: "",
  },
  {
    name: "Sokoto",
    capital: "Sokoto",
    flag: "",
  },
  {
    name: "Taraba",
    capital: "Jalingo",
    flag: "",
  },
  {
    name: "Yobe",
    capital: "Damaturu",
    flag: "",
  },
  {
    name: "Zamfara",
    capital: "Gusau",
    flag: "",
  },
  {
    name: "FCT",
    capital: "Abuja",
    flag: "",
  },
];
