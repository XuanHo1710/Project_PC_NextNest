import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateHistoryDto } from '@project-pc/common';
import { History, HistoryDocument } from './entities/history.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name) private historyModel: Model<HistoryDocument>,
  ) { }

  async create(createHistoryDto: CreateHistoryDto) {
    const createdHistory = new this.historyModel(createHistoryDto);
    return await createdHistory.save();
  }

  async findAll(filter: any = {}, userId: string) {
    const page = Math.min(Math.max(parseInt(filter.page, 10) || 1, 1), 10000);
    const limit = Math.min(Math.max(parseInt(filter.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const query: any = { adminId: userId };
    // Example filters
    if (filter.adminName) {
      query.adminName = { $regex: filter.adminName, $options: 'i' };
    }
    if (filter.method) {
      query.method = filter.method;
    }

    const [data, total] = await Promise.all([
      this.historyModel
        .find(query)
        .sort({ createdAt: -1 }) // Mới nhất lên đầu
        .skip(skip)
        .limit(limit)
        .exec(),
      this.historyModel.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} history`;
  }
}
