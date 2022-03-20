module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const hotpot = await ethers.getContract("HotpotToken")
  
  const { address } = await deploy("MasterChef", {
    from: deployer,
    args: [hotpot.address, dev, "1000000000000000000000", "0", "1000000000000000000000"],
    log: true,
    deterministicDeployment: false
  })

  if (await hotpot.owner() !== address) {
    // Transfer Hotpot Ownership to Chef
    console.log("Transfer Hotpot Ownership to Chef")
    await (await hotpot.transferOwnership(address)).wait()
  }

  const masterChef = await ethers.getContract("MasterChef")
  if (await masterChef.owner() !== dev) {
    // Transfer ownership of MasterChef to dev
    console.log("Transfer ownership of MasterChef to dev")
    await (await masterChef.transferOwnership(dev)).wait()
  }
}

module.exports.tags = ["MasterChef"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "HotpotToken"]
