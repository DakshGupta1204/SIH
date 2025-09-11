const Provenance = artifacts.require("Provenance");

module.exports = async function (deployer) {
  // set an initial pesticide threshold
  const initialMaxPesticideLevel = 100;
  await deployer.deploy(Provenance, initialMaxPesticideLevel);
};
