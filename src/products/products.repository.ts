import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from 'src/common/baseRepository.repository';
import { Model } from 'mongoose';
import { Product } from './schema/products.schema';

type ProductDocument = Product & Document;

@Injectable()
export class ProductRepository extends BaseRepository<ProductDocument> {
    constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {
        super(productModel);
    }
}