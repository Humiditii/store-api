import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './products.service';
import { ProductRepository } from './products.repository';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
import { AppResponse } from 'src/common/util/app.response';
import { FetchProductI } from './interface/product.interface';

describe('ProductService', () => {
    let productService: ProductService;
    let productRepository: ProductRepository;

    const mockProductRepository = {
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
        search: jest.fn(),
    };

    const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
    };

    const mockConnection = {
        startSession: jest.fn().mockResolvedValue(mockSession),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                { provide: ProductRepository, useValue: mockProductRepository },
                { provide: 'DatabaseConnection', useValue: mockConnection },
            ],
        }).compile();

        productService = module.get<ProductService>(ProductService);
        productRepository = module.get<ProductRepository>(ProductRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createProducts', () => {
        it('should create products successfully', async () => {
            const createDto: CreateProductDto[] = [
                { name: 'Laptop', description: 'Gaming laptop', category: 'Electronics', price: 1500 },
            ];

            mockProductRepository.create.mockResolvedValue([...createDto]);

            const result = await productService.createProducts(createDto);

            expect(result).toEqual([createDto]);
            expect(mockProductRepository.create).toHaveBeenCalledTimes(1);
        });
        it('should handle errors during product creation', async () => {
            mockProductRepository.create.mockRejectedValue(new Error('Database error'));

            try {
                await productService.createProducts([]);
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
    });

    describe('deleteProducts', () => {
        it('should delete products successfully', async () => {
            mockProductRepository.deleteMany.mockResolvedValue(true);

            const result = await productService.deleteProducts(['123', '456']);
            expect(result).toBe('done');
            expect(mockProductRepository.deleteMany).toHaveBeenCalledWith(['123', '456']);
        });

        it('should handle errors during product deletion', async () => {
            mockProductRepository.deleteMany.mockRejectedValue(new Error('Delete failed'));

            try {
                await productService.deleteProducts(['123']);
            } catch (error) {
                expect(error.message).toBe('Delete failed');
            }
        });
    });

    describe('updateProduct', () => {
        it('should update a product successfully', async () => {
            const updateDto: UpdateProductDto = {
                productId: '123',
                name: 'Updated Laptop',
                category: ''
            };

            mockProductRepository.findById.mockResolvedValue({ id: '123', name: 'Laptop' });
            mockProductRepository.update.mockResolvedValue({ id: '123', name: 'Updated Laptop' });

            const result = await productService.updateProduct(updateDto);
            expect(result).toEqual({ id: '123', name: 'Updated Laptop' });
        });

        it('should return error if product not found', async () => {
            mockProductRepository.findById.mockResolvedValue(null);

            try {
                await productService.updateProduct({ productId: '999', name: 'Updated Laptop', category: '' });
            } catch (error) {
                expect(error.message).toBe('Product not found');
            }
        });

        it('should handle errors during product update', async () => {
            mockProductRepository.findById.mockRejectedValue(new Error('Database error'));

            try {
                await productService.updateProduct({ productId: '123', name: 'Updated Laptop', category: '' });
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
    });

    describe('fetchProducts', () => {
        it('should fetch products with search and filters', async () => {
            const fetchParams: FetchProductI = {
                page: 1,
                limit: 10,
                search: 'Laptop',
                categoryFilter: 'Electronics' as any,
            };

            const mockProducts = [
                { id: '1', name: 'Laptop', category: 'Electronics', price: 1500 },
            ];

            mockProductRepository.search.mockResolvedValue(mockProducts);

            const result = await productService.fetchProducts(fetchParams);
            expect(result).toEqual(mockProducts);
            expect(mockProductRepository.search).toHaveBeenCalledTimes(1);
        });

        it('should handle errors during product fetch', async () => {
            mockProductRepository.search.mockRejectedValue(new Error('Fetch error'));

            try {
                await productService.fetchProducts({});
            } catch (error) {
                expect(error.message).toBe('Fetch error');
            }
        });
    });
});