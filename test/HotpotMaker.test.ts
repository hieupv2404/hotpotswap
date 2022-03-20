import { expect } from "chai";
import { prepare, deploy, getBigNumber, createSLP } from "./utilities"

describe("HotpotMaker", function () {
  before(async function () {
    await prepare(this, ["HotpotMaker", "HotpotBar", "HotpotMakerExploitMock", "ERC20Mock", "UniswapV2Factory", "UniswapV2Pair"])
  })

  beforeEach(async function () {
    await deploy(this, [
      ["hotpot", this.ERC20Mock, ["SUSHI", "SUSHI", getBigNumber("10000000")]],
      ["dai", this.ERC20Mock, ["DAI", "DAI", getBigNumber("10000000")]],
      ["mic", this.ERC20Mock, ["MIC", "MIC", getBigNumber("10000000")]],
      ["usdc", this.ERC20Mock, ["USDC", "USDC", getBigNumber("10000000")]],
      ["weth", this.ERC20Mock, ["WETH", "ETH", getBigNumber("10000000")]],
      ["strudel", this.ERC20Mock, ["$TRDL", "$TRDL", getBigNumber("10000000")]],
      ["factory", this.UniswapV2Factory, [this.alice.address]],
    ])
    await deploy(this, [["bar", this.HotpotBar, [this.hotpot.address]]])
    await deploy(this, [["hotpotMaker", this.HotpotMaker, [this.factory.address, this.bar.address, this.hotpot.address, this.weth.address]]])
    await deploy(this, [["exploiter", this.HotpotMakerExploitMock, [this.hotpotMaker.address]]])
    await createSLP(this, "hotpotEth", this.hotpot, this.weth, getBigNumber(10))
    await createSLP(this, "strudelEth", this.strudel, this.weth, getBigNumber(10))
    await createSLP(this, "daiEth", this.dai, this.weth, getBigNumber(10))
    await createSLP(this, "usdcEth", this.usdc, this.weth, getBigNumber(10))
    await createSLP(this, "micUSDC", this.mic, this.usdc, getBigNumber(10))
    await createSLP(this, "hotpotUSDC", this.hotpot, this.usdc, getBigNumber(10))
    await createSLP(this, "daiUSDC", this.dai, this.usdc, getBigNumber(10))
    await createSLP(this, "daiMIC", this.dai, this.mic, getBigNumber(10))
  })
  describe("setBridge", function () {
    it("does not allow to set bridge for Hotpot", async function () {
      await expect(this.hotpotMaker.setBridge(this.hotpot.address, this.weth.address)).to.be.revertedWith("HotpotMaker: Invalid bridge")
    })

    it("does not allow to set bridge for WETH", async function () {
      await expect(this.hotpotMaker.setBridge(this.weth.address, this.hotpot.address)).to.be.revertedWith("HotpotMaker: Invalid bridge")
    })

    it("does not allow to set bridge to itself", async function () {
      await expect(this.hotpotMaker.setBridge(this.dai.address, this.dai.address)).to.be.revertedWith("HotpotMaker: Invalid bridge")
    })

    it("emits correct event on bridge", async function () {
      await expect(this.hotpotMaker.setBridge(this.dai.address, this.hotpot.address))
        .to.emit(this.hotpotMaker, "LogBridgeSet")
        .withArgs(this.dai.address, this.hotpot.address)
    })
  })
  describe("convert", function () {
    it("should convert SUSHI - ETH", async function () {
      await this.hotpotEth.transfer(this.hotpotMaker.address, getBigNumber(1))
      await this.hotpotMaker.convert(this.hotpot.address, this.weth.address)
      expect(await this.hotpot.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.hotpotEth.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.hotpot.balanceOf(this.bar.address)).to.equal("1897569270781234370")
    })

    it("should convert USDC - ETH", async function () {
      await this.usdcEth.transfer(this.hotpotMaker.address, getBigNumber(1))
      await this.hotpotMaker.convert(this.usdc.address, this.weth.address)
      expect(await this.hotpot.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.usdcEth.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.hotpot.balanceOf(this.bar.address)).to.equal("1590898251382934275")
    })

    it("should convert $TRDL - ETH", async function () {
      await this.strudelEth.transfer(this.hotpotMaker.address, getBigNumber(1))
      await this.hotpotMaker.convert(this.strudel.address, this.weth.address)
      expect(await this.hotpot.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.strudelEth.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.hotpot.balanceOf(this.bar.address)).to.equal("1590898251382934275")
    })

    it("should convert USDC - SUSHI", async function () {
      await this.hotpotUSDC.transfer(this.hotpotMaker.address, getBigNumber(1))
      await this.hotpotMaker.convert(this.usdc.address, this.hotpot.address)
      expect(await this.hotpot.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.hotpotUSDC.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.hotpot.balanceOf(this.bar.address)).to.equal("1897569270781234370")
    })

    it("should convert using standard ETH path", async function () {
      await this.daiEth.transfer(this.hotpotMaker.address, getBigNumber(1))
      await this.hotpotMaker.convert(this.dai.address, this.weth.address)
      expect(await this.hotpot.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.daiEth.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.hotpot.balanceOf(this.bar.address)).to.equal("1590898251382934275")
    })

    it("converts MIC/USDC using more complex path", async function () {
      await this.micUSDC.transfer(this.hotpotMaker.address, getBigNumber(1))
      await this.hotpotMaker.setBridge(this.usdc.address, this.hotpot.address)
      await this.hotpotMaker.setBridge(this.mic.address, this.usdc.address)
      await this.hotpotMaker.convert(this.mic.address, this.usdc.address)
      expect(await this.hotpot.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.micUSDC.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.hotpot.balanceOf(this.bar.address)).to.equal("1590898251382934275")
    })

    it("converts DAI/USDC using more complex path", async function () {
      await this.daiUSDC.transfer(this.hotpotMaker.address, getBigNumber(1))
      await this.hotpotMaker.setBridge(this.usdc.address, this.hotpot.address)
      await this.hotpotMaker.setBridge(this.dai.address, this.usdc.address)
      await this.hotpotMaker.convert(this.dai.address, this.usdc.address)
      expect(await this.hotpot.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.daiUSDC.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.hotpot.balanceOf(this.bar.address)).to.equal("1590898251382934275")
    })

    it("converts DAI/MIC using two step path", async function () {
      await this.daiMIC.transfer(this.hotpotMaker.address, getBigNumber(1))
      await this.hotpotMaker.setBridge(this.dai.address, this.usdc.address)
      await this.hotpotMaker.setBridge(this.mic.address, this.dai.address)
      await this.hotpotMaker.convert(this.dai.address, this.mic.address)
      expect(await this.hotpot.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.daiMIC.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.hotpot.balanceOf(this.bar.address)).to.equal("1200963016721363748")
    })

    it("reverts if it loops back", async function () {
      await this.daiMIC.transfer(this.hotpotMaker.address, getBigNumber(1))
      await this.hotpotMaker.setBridge(this.dai.address, this.mic.address)
      await this.hotpotMaker.setBridge(this.mic.address, this.dai.address)
      await expect(this.hotpotMaker.convert(this.dai.address, this.mic.address)).to.be.reverted
    })

    it("reverts if caller is not EOA", async function () {
      await this.hotpotEth.transfer(this.hotpotMaker.address, getBigNumber(1))
      await expect(this.exploiter.convert(this.hotpot.address, this.weth.address)).to.be.revertedWith("HotpotMaker: must use EOA")
    })

    it("reverts if pair does not exist", async function () {
      await expect(this.hotpotMaker.convert(this.mic.address, this.micUSDC.address)).to.be.revertedWith("HotpotMaker: Invalid pair")
    })

    it("reverts if no path is available", async function () {
      await this.micUSDC.transfer(this.hotpotMaker.address, getBigNumber(1))
      await expect(this.hotpotMaker.convert(this.mic.address, this.usdc.address)).to.be.revertedWith("HotpotMaker: Cannot convert")
      expect(await this.hotpot.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.micUSDC.balanceOf(this.hotpotMaker.address)).to.equal(getBigNumber(1))
      expect(await this.hotpot.balanceOf(this.bar.address)).to.equal(0)
    })
  })

  describe("convertMultiple", function () {
    it("should allow to convert multiple", async function () {
      await this.daiEth.transfer(this.hotpotMaker.address, getBigNumber(1))
      await this.hotpotEth.transfer(this.hotpotMaker.address, getBigNumber(1))
      await this.hotpotMaker.convertMultiple([this.dai.address, this.hotpot.address], [this.weth.address, this.weth.address])
      expect(await this.hotpot.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.daiEth.balanceOf(this.hotpotMaker.address)).to.equal(0)
      expect(await this.hotpot.balanceOf(this.bar.address)).to.equal("3186583558687783097")
    })
  })
})
