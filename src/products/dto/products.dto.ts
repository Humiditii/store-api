import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty({ message: 'Product name is required' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'Description is required' })
    description: string;

    @IsString()
    @IsNotEmpty({ message: 'Description is required' })
    category: string;

    @IsNumber()
    @Min(0, { message: 'Price must be at least 0' })
    price: number;
}

export class UpdateProductDto {

    productId?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    description?: string;

    category: string;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'Price must be at least 0' })
    price?: number;
}