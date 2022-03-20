module.exports = async function ({ ethers: { getNamedSigner }, getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const factory = await ethers.getContract("UniswapV2Factory")
  const bar = await ethers.getContract("HotpotBar")
  const hotpot = await ethers.getContract("HotpotToken")
  
  await deploy("HotpotMaker", {
    from: deployer,
    args: [factory.address, bar.address, hotpot.address, "0xc778417e063141139fce010982780140aa0cd5ab"],
    log: true,
    deterministicDeployment: false
  })

  const maker = await ethers.getContract("HotpotMaker")
  if (await maker.owner() !== dev) {
    console.log("Setting maker owner")
    await (await maker.transferOwnership(dev, true, false)).wait()
  }
}

module.exports.tags = ["HotpotMaker"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "HotpotBar", "HotpotToken"]