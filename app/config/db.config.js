module.exports = {
  HOST: "ep-restless-truth-af6iitu5-pooler.c-2.us-west-2.aws.neon.tech",
  USER: "neondb_owner",
  PASSWORD: "npg_O2mP1RLKdwMG",
  DB: "neondb",          
  dialect: "postgres",   
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
