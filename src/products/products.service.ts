import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { ProductRepository } from "./products.repository";
import { CreateProductDto, UpdateProductDto } from "./dto/products.dto";
import { AppResponse } from "src/common/util/app.response";
import { FetchProductI } from "./interface/product.interface";
import { AppErr } from "src/common/interface/main.interface";

@Injectable()
export class ProductService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly productRepository: ProductRepository
    ){}

    async createProducts(createDto: CreateProductDto[]): Promise<any> {
        // const session = await this.connection.startSession();
        // session.startTransaction();
        try {
            const product = await Promise.all(createDto.map(p => this.productRepository.create(p) ))
            return product
        } catch (error) {
            // await session.abortTransaction();
            // session.endSession();
            error.location = `ProductService.${this.createProducts.name} method`;
            return AppResponse.error(error)
        }
    }

    async deleteProducts(ids:string[]): Promise<string> {
        // const session = await this.connection.startSession();
        // session.startTransaction();
        try {
            await this.productRepository.deleteMany(ids);
            return 'done'
        } catch (error) {
            // await session.abortTransaction();
            // session.endSession();
            error.location = `ProductService.${this.deleteProducts.name} method`;
            return AppResponse.error(error)
        }
    }

    async updateProduct(updateProductDto: UpdateProductDto): Promise<any> {
        try {
            const {productId, ...data} = updateProductDto;

            const findProduct = await this.productRepository.findById(productId as string)

            if(!findProduct){
                const err: AppErr = {
                    message: "Product not found",
                    status: 404
                }
                return AppResponse.error(err)
            }

            return await this.productRepository.update(productId as string, data)

        } catch (error) {
            error.location = `ProductService.${this.deleteProducts.name} method`;
            return AppResponse.error(error)
        }
    }

    /**
     * Should be able to fetch all products
     * with and without pagination i.e page and limit
     * with and without search by description, price, name
     * with and without filters
     */
    async fetchProducts(fetch: FetchProductI):Promise<any>{
        const session = await this.connection.startSession();
        session.startTransaction();
        try {

            const filter = {
                ...(fetch?.categoryFilter? {
                    category: fetch?.categoryFilter
                } : null),
                ...(fetch?.priceFilter ? {
                    ...(fetch?.priceFilter?.gte ? { $gte: fetch?.priceFilter?.gte } : null),
                    ...(fetch?.priceFilter?.lte ? { $lte: fetch?.priceFilter?.lte } : null)
                } : null),

            }

            return await this.productRepository.search(filter, fetch?.search ?? undefined, ['category', 'description', 'name'], fetch?.limit ?? undefined, fetch?.page ?? undefined )

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            error.location = `ProductService.${this.fetchProducts.name} method`;
            return AppResponse.error(error)
        }
    }


}