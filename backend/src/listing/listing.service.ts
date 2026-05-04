import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingQueryDto } from './dto/listing-query.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Create ──────────────────────────────────────────────────────────────────

  async create(userId: number, dto: CreateListingDto) {
    const { productIds, ...rest } = dto;

    const listing = await this.prisma.listing.create({
      data: {
        ...rest,
        userId,
        ...(productIds?.length && {
          products: {
            connect: productIds.map((id) => ({ id })),
          },
        }),
      },
      include: this.defaultInclude(),
    });

    return listing;
  }

  // ─── Find All (with pagination & filters) ────────────────────────────────────

  async findAll(query: ListingQueryDto) {
    const { page = 1, limit = 10, search, isActive, userId } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(isActive !== undefined && { isActive }),
      ...(userId && { userId }),
      ...(search && {
        OR: [
          { caption: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [listings, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.defaultInclude(),
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: listings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Find One ─────────────────────────────────────────────────────────────────

  async findOne(id: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });

    if (!listing) {
      throw new NotFoundException(`Listing #${id} not found`);
    }

    // Increment view count
    await this.prisma.listing.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return listing;
  }

  // ─── Find by User ─────────────────────────────────────────────────────────────

  async findByUser(userId: number, query: ListingQueryDto) {
    return this.findAll({ ...query, userId });
  }

  // ─── Update ──────────────────────────────────────────────────────────────────

  async update(id: number, userId: number, dto: UpdateListingDto) {
    await this.ensureOwner(id, userId);

    const { productIds, ...rest } = dto as CreateListingDto;

    const listing = await this.prisma.listing.update({
      where: { id },
      data: {
        ...rest,
        ...(productIds !== undefined && {
          products: {
            set: productIds.map((pid) => ({ id: pid })),
          },
        }),
      },
      include: this.defaultInclude(),
    });

    return listing;
  }

  // ─── Remove ──────────────────────────────────────────────────────────────────

  async remove(id: number, userId: number) {
    await this.ensureOwner(id, userId);

    await this.prisma.listing.delete({ where: { id } });

    return { message: `Listing #${id} deleted successfully` };
  }

  // ─── Toggle Active ────────────────────────────────────────────────────────────

  async toggleActive(id: number, userId: number) {
    const listing = await this.ensureOwner(id, userId);

    return this.prisma.listing.update({
      where: { id },
      data: { isActive: !listing.isActive },
      include: this.defaultInclude(),
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async ensureOwner(id: number, userId: number) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw new NotFoundException(`Listing #${id} not found`);
    }

    if (listing.userId !== userId) {
      throw new ForbiddenException('You do not own this listing');
    }

    return listing;
  }

  private defaultInclude() {
    return {
      user: {
        select: {
          id: true,
          // add other safe user fields here, e.g. name, avatar
        },
      },
      products: true,
    };
  }
}
