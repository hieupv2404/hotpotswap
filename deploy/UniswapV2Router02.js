module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const chainId = await getChainId();

  let wethAddress = "0xc778417E063141139Fce010982780140Aa0cD5Ab";

  const factoryAddress = (await deployments.get("UniswapV2Factory")).address;

  await deploy("UniswapV2Router02", {
    from: deployer,
    args: [factoryAddress, wethAddress],
    log: true,
    deterministicDeployment: false,
  });
};

module.exports.tags = ["UniswapV2Router02", "AMM"];
module.exports.dependencies = ["UniswapV2Factory", "Mocks"];
