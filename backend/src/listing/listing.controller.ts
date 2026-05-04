import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingQueryDto } from './dto/listing-query.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingService } from './listing.service';

@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  // ─── POST /listings ───────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@GetUser('id') userId: number, @Body() dto: CreateListingDto) {
    return this.listingService.create(userId, dto);
  }

  // ─── GET /listings ────────────────────────────────────────────────────────────
  @Get()
  findAll(@Query() query: ListingQueryDto) {
    return this.listingService.findAll(query);
  }

  // ─── GET /listings/me ─────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMine(@GetUser('id') userId: number, @Query() query: ListingQueryDto) {
    return this.listingService.findByUser(userId, query);
  }

  // ─── GET /listings/user/:userId ───────────────────────────────────────────────
  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: ListingQueryDto,
  ) {
    return this.listingService.findByUser(userId, query);
  }

  // ─── GET /listings/:id ────────────────────────────────────────────────────────
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.listingService.findOne(id);
  }

  // ─── PATCH /listings/:id ──────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingService.update(id, userId, dto);
  }

  // ─── PATCH /listings/:id/toggle-active ────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle-active')
  toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return this.listingService.toggleActive(id, userId);
  }

  // ─── DELETE /listings/:id ─────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser('id') userId: number) {
    return this.listingService.remove(id, userId);
  }
}
