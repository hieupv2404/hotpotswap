module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const chainId = await getChainId();

  let wethAddress = "0xc778417E063141139Fce010982780140Aa0cD5Ab";

  await deploy("BentoBoxV1", {
    from: deployer,
    args: [wethAddress],
    log: true,
    deterministicDeployment: false,
  });
};

module.exports.tags = ["BentoBox"];
