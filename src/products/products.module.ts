import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Product, ProductSchema } from "./schema/products.schema";
import { ProductService } from "./products.service";
import { ProductRepository } from "./products.repository";
import { ProductController } from "./products.controller";

@Module({
    imports:[
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
        ]),
    ],
    providers:[ProductService, ProductRepository],
    controllers:[ProductController]
})

export class ProductModule {}