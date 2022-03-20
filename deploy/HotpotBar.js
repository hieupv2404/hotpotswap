module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const hotpot = await deployments.get("HotpotToken")

  await deploy("HotpotBar", {
    from: deployer,
    args: [hotpot.address],
    log: true,
    deterministicDeployment: false
  })
}

module.exports.tags = ["HotpotBar"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "HotpotToken"]
