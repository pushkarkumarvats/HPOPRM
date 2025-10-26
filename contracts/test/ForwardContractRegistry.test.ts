import { expect } from "chai";
import { ethers } from "hardhat";
import { ForwardContractRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ForwardContractRegistry", function () {
  let contract: ForwardContractRegistry;
  let buyer: SignerWithAddress;
  let seller: SignerWithAddress;

  beforeEach(async function () {
    [buyer, seller] = await ethers.getSigners();
    const ForwardContractRegistry = await ethers.getContractFactory("ForwardContractRegistry");
    contract = await ForwardContractRegistry.deploy();
    await contract.waitForDeployment();
  });

  describe("Contract Creation", function () {
    it("Should create a new contract", async function () {
      const contractId = "CONTRACT_001";
      const commodity = "soybean";
      const quantity = 1000;
      const priceFixed = ethers.parseEther("5");
      const deliveryDate = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days
      const ipfsHash = "QmTest123";

      await contract.connect(buyer).createContract(
        contractId,
        seller.address,
        commodity,
        quantity,
        priceFixed,
        deliveryDate,
        ipfsHash
      );

      const stored = await contract.getContract(contractId);
      expect(stored.buyer).to.equal(buyer.address);
      expect(stored.seller).to.equal(seller.address);
      expect(stored.commodity).to.equal(commodity);
      expect(stored.quantity).to.equal(quantity);
    });

    it("Should not allow duplicate contract IDs", async function () {
      const contractId = "CONTRACT_002";
      
      await contract.connect(buyer).createContract(
        contractId,
        seller.address,
        "soybean",
        1000,
        ethers.parseEther("5"),
        Math.floor(Date.now() / 1000) + 86400 * 30,
        "QmTest"
      );

      await expect(
        contract.connect(buyer).createContract(
          contractId,
          seller.address,
          "soybean",
          1000,
          ethers.parseEther("5"),
          Math.floor(Date.now() / 1000) + 86400 * 30,
          "QmTest"
        )
      ).to.be.revertedWith("Contract exists");
    });
  });

  describe("Contract Signing", function () {
    const contractId = "CONTRACT_003";

    beforeEach(async function () {
      await contract.connect(buyer).createContract(
        contractId,
        seller.address,
        "soybean",
        1000,
        ethers.parseEther("5"),
        Math.floor(Date.now() / 1000) + 86400 * 30,
        "QmTest"
      );
    });

    it("Should allow buyer to sign", async function () {
      await contract.connect(buyer).signContract(contractId);
      const stored = await contract.getContract(contractId);
      expect(stored.buyerSigned).to.be.true;
    });

    it("Should allow seller to sign", async function () {
      await contract.connect(seller).signContract(contractId);
      const stored = await contract.getContract(contractId);
      expect(stored.sellerSigned).to.be.true;
    });

    it("Should update status when both parties sign", async function () {
      await contract.connect(buyer).signContract(contractId);
      await contract.connect(seller).signContract(contractId);
      
      const stored = await contract.getContract(contractId);
      expect(stored.status).to.equal(1); // Signed
    });
  });

  describe("Escrow", function () {
    const contractId = "CONTRACT_004";

    beforeEach(async function () {
      await contract.connect(buyer).createContract(
        contractId,
        seller.address,
        "soybean",
        1000,
        ethers.parseEther("5"),
        Math.floor(Date.now() / 1000) + 86400 * 30,
        "QmTest"
      );
      await contract.connect(buyer).signContract(contractId);
      await contract.connect(seller).signContract(contractId);
    });

    it("Should accept escrow deposits", async function () {
      const amount = ethers.parseEther("1");
      await contract.connect(buyer).depositEscrow(contractId, { value: amount });
      
      const stored = await contract.getContract(contractId);
      expect(stored.escrowAmount).to.equal(amount);
    });
  });
});
