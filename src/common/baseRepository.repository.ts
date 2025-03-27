import { Model, ClientSession, FilterQuery } from 'mongoose';

export class BaseRepository<T extends Document> {
    constructor(private readonly model: Model<T>) { }

    async create(data: Partial<T>, session?: ClientSession): Promise<T> {
        return new this.model(data).save({ session });
    }

    async findById(id: string, session?: ClientSession): Promise<T | null> {
        return this.model.findById(id).session(session ?? null).exec();
    }

    async findOne(filter: any, session?: ClientSession): Promise<T | null> {
        return this.model.findOne(filter).session(session ?? null).exec();
    }

    async update(id: string, data: Partial<T>, session?: ClientSession): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, data, { new: true, session: session ?? null }).exec();
    }

    async delete(id: string, session?: ClientSession): Promise<T | null> {
        return this.model.findByIdAndDelete(id).session(session ?? null).exec();
    }

    async deleteMany(ids:string[]):Promise<void> {
        await this.model.deleteMany({_id: {$in: ids}})
    }
    
    /**
     * Perform a case-insensitive search on multiple fields with pagination.
     * @param searchTerm The string to search for.
     * @param fields The array of fields to search in.
     * @param additionalFilters Optional additional query filters.
     * @param limit Number of records per batch (default: 10).
     * @param page Page number (default: 1).
     * @returns The list of matched documents.
     */
    async search(
        additionalFilters: FilterQuery<T> = {},
        searchTerm?: string,
        fields?: string[],
        limit = 10,
        page = 1
    ): Promise<T[]> {

        const skip = (page - 1) * limit;

        if (!searchTerm || fields?.length === 0){
            return this.model
                .find(additionalFilters)
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 })
                .exec();
        };

        const searchConditions = fields?.map((field) => ({
            [field]: { $regex: searchTerm, $options: 'i' },
        }));

        return this.model
            .find({ $or: searchConditions, ...additionalFilters })
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 })
            .exec();
    }
}