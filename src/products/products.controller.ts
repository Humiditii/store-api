import { Body, Controller, Get, Param, Patch, Post, Query, Res } from "@nestjs/common";
import { ProductService } from "./products.service";
import { AppResponse } from "src/common/util/app.response";
import { Response } from "express";
import { CategoryEnum, FetchProductI } from "./interface/product.interface";
import { CreateProductDto, UpdateProductDto } from "./dto/products.dto";

@Controller('products')
export class ProductController {
    constructor(
        private readonly productService:ProductService
    ){}

     private readonly success = AppResponse.success;

     @Post('create')
     async create(
         @Body() create: { products: CreateProductDto[] },
         @Res() res: Response
     ):Promise<Response>{

        const data =  await this.productService.createProducts(create.products)

         return res.status(200).json(this.success('Product creation success!', 201, data))
     }

    @Patch('update/:productId')
    async update(
        @Body() updateProductDto: UpdateProductDto,
        @Res() res: Response,
        @Param('productId') productId:string
    ): Promise<Response> {

        updateProductDto.productId = productId

        const data = await this.productService.updateProduct(updateProductDto)

        return res.status(200).json(this.success('Product updated!', 200, data))
    }

    @Post('delete')
    async deleteProducts(
        @Body() { ids }: { ids: string[] },
        @Res() res: Response
    ): Promise<Response> {

        await this.productService.deleteProducts(ids)

        return res.status(200).json(this.success('Product deleted!', 200))
    }

     @Get('fetch')
     async fetch(
        @Res() res:Response,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('category') category?: CategoryEnum,
        @Query('search') search?: string,
        @Query('priceLte') priceLte?: number,
        @Query('pricegte') pricegte?: number,
     ):Promise<Response>{

        const payload: FetchProductI = {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined ,
            categoryFilter: category ?? undefined,
            search: search ?? undefined,
            priceFilter: {
                lte: priceLte ? Number(priceLte) : undefined,
                gte: pricegte ? Number(pricegte) : undefined
            },

        }
        
        const data = await this.productService.fetchProducts(payload)

         return res.status(200).json(this.success('Products fetched!', 200, data))
    }

}