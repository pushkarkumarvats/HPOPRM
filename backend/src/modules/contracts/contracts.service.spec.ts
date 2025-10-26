import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ContractsService', () => {
  let service: ContractsService;
  let prisma: PrismaService;
  let blockchain: BlockchainService;

  const mockPrismaService = {
    contract: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockBlockchainService = {
    publishContractToChain: jest.fn(),
    uploadToIPFS: jest.fn(),
    getContractFromChain: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: BlockchainService, useValue: mockBlockchainService },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
    prisma = module.get<PrismaService>(PrismaService);
    blockchain = module.get<BlockchainService>(BlockchainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createContract', () => {
    it('should create a forward contract', async () => {
      const userId = 'user-1';
      const createDto = {
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        commodity: 'soybean',
        quantity: 500,
        priceFixed: 5500,
        deliveryDate: new Date('2024-12-31'),
        deliveryLocation: 'Pune, Maharashtra',
        terms: { quality: 'Grade A' },
      };

      const mockContract = {
        id: 'contract-1',
        contractHash: 'hash-123',
        ...createDto,
        totalValue: 5500 * 500,
        status: 'draft',
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'buyer-1' });
      mockPrismaService.contract.create.mockResolvedValue(mockContract);

      const result = await service.createContract(userId, createDto);

      expect(result).toEqual(mockContract);
      expect(result.totalValue).toBe(2750000);
      expect(mockPrismaService.contract.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if buyer not found', async () => {
      const userId = 'user-1';
      const createDto = {
        buyerId: 'nonexistent',
        sellerId: 'seller-1',
        commodity: 'soybean',
        quantity: 500,
        priceFixed: 5500,
        deliveryDate: new Date('2024-12-31'),
        deliveryLocation: 'Pune',
        terms: {},
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.createContract(userId, createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('signContract', () => {
    it('should sign a contract as buyer', async () => {
      const contractId = 'contract-1';
      const userId = 'buyer-1';
      const signature = '0xSignature123';

      const mockContract = {
        id: contractId,
        buyerId: userId,
        sellerId: 'seller-1',
        status: 'draft',
        buyerSignature: null,
        sellerSignature: null,
      };

      mockPrismaService.contract.findUnique.mockResolvedValue(mockContract);
      mockPrismaService.contract.update.mockResolvedValue({
        ...mockContract,
        buyerSignature: signature,
        status: 'pending',
      });

      const result = await service.signContract(contractId, userId, signature);

      expect(result.buyerSignature).toBe(signature);
      expect(mockPrismaService.contract.update).toHaveBeenCalledWith({
        where: { id: contractId },
        data: expect.objectContaining({ buyerSignature: signature }),
      });
    });

    it('should complete contract when both parties sign', async () => {
      const contractId = 'contract-1';
      const userId = 'seller-1';
      const signature = '0xSignature456';

      const mockContract = {
        id: contractId,
        buyerId: 'buyer-1',
        sellerId: userId,
        status: 'pending',
        buyerSignature: '0xSignature123',
        sellerSignature: null,
      };

      mockPrismaService.contract.findUnique.mockResolvedValue(mockContract);
      mockPrismaService.contract.update.mockResolvedValue({
        ...mockContract,
        sellerSignature: signature,
        status: 'signed',
        signedAt: new Date(),
      });

      const result = await service.signContract(contractId, userId, signature);

      expect(result.status).toBe('signed');
      expect(result.signedAt).toBeDefined();
    });

    it('should throw NotFoundException if contract not found', async () => {
      mockPrismaService.contract.findUnique.mockResolvedValue(null);

      await expect(service.signContract('nonexistent', 'user-1', 'sig')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException if user not a party', async () => {
      const mockContract = {
        id: 'contract-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        status: 'draft',
      };

      mockPrismaService.contract.findUnique.mockResolvedValue(mockContract);

      await expect(service.signContract('contract-1', 'other-user', 'sig')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('publishToIPFS', () => {
    it('should publish contract to IPFS', async () => {
      const contractId = 'contract-1';
      const ipfsCid = 'QmHash123';

      const mockContract = {
        id: contractId,
        status: 'signed',
        buyerSignature: '0xSig1',
        sellerSignature: '0xSig2',
      };

      mockPrismaService.contract.findUnique.mockResolvedValue(mockContract);
      mockBlockchainService.uploadToIPFS.mockResolvedValue(ipfsCid);
      mockPrismaService.contract.update.mockResolvedValue({
        ...mockContract,
        ipfsCid,
      });

      const result = await service.publishToIPFS(contractId);

      expect(result.ipfsCid).toBe(ipfsCid);
      expect(mockBlockchainService.uploadToIPFS).toHaveBeenCalled();
    });

    it('should throw BadRequestException if contract not signed', async () => {
      const mockContract = {
        id: 'contract-1',
        status: 'draft',
      };

      mockPrismaService.contract.findUnique.mockResolvedValue(mockContract);

      await expect(service.publishToIPFS('contract-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserContracts', () => {
    it('should return contracts for a user', async () => {
      const userId = 'user-1';
      const mockContracts = [
        {
          id: 'contract-1',
          buyerId: userId,
          sellerId: 'user-2',
          commodity: 'soybean',
          status: 'signed',
        },
        {
          id: 'contract-2',
          buyerId: 'user-3',
          sellerId: userId,
          commodity: 'mustard',
          status: 'draft',
        },
      ];

      mockPrismaService.contract.findMany.mockResolvedValue(mockContracts);

      const result = await service.getUserContracts(userId);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.contract.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
        orderBy: { createdAt: 'desc' },
        include: { buyer: true, seller: true },
      });
    });
  });

  describe('settleContract', () => {
    it('should settle a published contract', async () => {
      const contractId = 'contract-1';
      const mockContract = {
        id: contractId,
        status: 'published',
        blockchainTxHash: '0xTxHash',
      };

      mockPrismaService.contract.findUnique.mockResolvedValue(mockContract);
      mockPrismaService.contract.update.mockResolvedValue({
        ...mockContract,
        status: 'settled',
        settledAt: new Date(),
      });

      const result = await service.settleContract(contractId);

      expect(result.status).toBe('settled');
      expect(result.settledAt).toBeDefined();
    });

    it('should throw BadRequestException if contract not published', async () => {
      const mockContract = {
        id: 'contract-1',
        status: 'signed',
      };

      mockPrismaService.contract.findUnique.mockResolvedValue(mockContract);

      await expect(service.settleContract('contract-1')).rejects.toThrow(BadRequestException);
    });
  });
});
