import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) 
export class Product extends Document {
    @Prop({ required: true, type: String })
    name: string;

    @Prop({ type: String })
    description: string;

    @Prop({ required: true, type: Number })
    price: number;

    @Prop({ type: String })
    category: string;

    @Prop({ type: Date })
    createdAt?: Date;

    @Prop({ type: Date })
    updatedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);