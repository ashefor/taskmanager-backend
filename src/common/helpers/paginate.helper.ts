import { SelectQueryBuilder, Repository, ObjectLiteral } from 'typeorm';
import { PaginationQueryDto } from './dto/pagination-query.dto';


interface PaginateOptions<T extends ObjectLiteral> {
    repository?: Repository<T>;
    queryBuilder?: SelectQueryBuilder<T>;
    alias?: string;
    pagination: PaginationQueryDto;
    searchFields?: (keyof T)[];
    relations?: string[];
    defaultSort?: string;
    filters?: Record<string, any>; // 👈 new
    transform?: (entity: T) => any;
    includeDeleted?: boolean;
}

export async function PaginateRepositoryHelper<T>({
    repository,
    queryBuilder,
    alias = 'entity',
    pagination,
    searchFields = [],
    relations = [],
    defaultSort = 'createdAt',
    filters = {},
    transform,
    includeDeleted = false
}: PaginateOptions<T | any>) {
    const { page = 1,
        limit = 10, search, sortBy, sortOrder,
        start_date,
        end_date, } = pagination;
    const skip = (page - 1) * limit;

    let qb: SelectQueryBuilder<T | any>;

    if (repository) qb = repository.createQueryBuilder(alias);
    else if (queryBuilder) qb = queryBuilder;
    else throw new Error('Either repository or queryBuilder must be provided');

    if (includeDeleted) {
        qb = qb.withDeleted();
    }

    // 🔍 Search support
    if (search && searchFields.length > 0) {
        qb.andWhere(
            searchFields
                .map((field) => `${alias}.${String(field)} LIKE :search`)
                .join(' OR '),
            { search: `%${search}%` },
        );
    }

    // 🧮 Dynamic filters
    Object.entries(filters).forEach(([key, value], idx) => {
        if (value !== undefined && value !== null && value !== '') {
            const paramKey = `${key}_${idx}`;
            qb.andWhere(`${alias}.${key} = :${paramKey}`, { [paramKey]: value });
        }
    });

    // 🔁 Sorting
    const sortColumn = sortBy ? `${alias}.${sortBy}` : `${alias}.${defaultSort}`;
    qb.orderBy(sortColumn, sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');

    // Include relations if specified
    for (const relation of relations) {
        qb.leftJoinAndSelect(`${alias}.${relation}`, relation);
    }

    // 🔍 Date filtering
    if (start_date && end_date) {
        qb.where('task.createdAt BETWEEN :start_date AND :end_date', {
            start_date: new Date(start_date).toISOString(),
            end_date : new Date(end_date).toISOString(),
        }).getMany();
    } else if (start_date) {
        qb.where('task.createdAt >= :start_date', { start_date }).getMany();
    } else if (end_date) {
        qb.where('task.createdAt <= :end_date', { end_date }).getMany();
    }


    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    const transformFn = typeof transform === 'function' ? transform : undefined;
    const transformedItems = items.map((t) => transformFn ? transformFn(t) : t);
    return {
        items: transformedItems,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
