import { Injectable } from "@nestjs/common";
import { CreateDictionaryDto, CreateDictionaryItemDto, UpdateDictionaryDto } from "./dto";
import { BaseService } from "@/common/service/base";
import { Dictionary } from "./entities/dictionary.entity";
import { DictionaryItem } from "./entities/dictionaryItem.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApiResult } from "@/common/utils/result";

@Injectable()
export class DictionaryService extends BaseService {
  constructor(
    @InjectRepository(Dictionary)
    private readonly dictionaryRepository: Repository<Dictionary>,
    @InjectRepository(DictionaryItem)
    private readonly dictionaryItemRepository: Repository<DictionaryItem>
  ) {
    super();
  }

  async create(createDictionaryDto: CreateDictionaryDto): Promise<ApiResult<Dictionary | null>> {
    try {
      let dictionary = await this.dictionaryRepository.findOne({ where: { type: createDictionaryDto.type } });
      if (dictionary) {
        return ApiResult.error<null>("字典类型已存在");
      }
      let data = await this.dictionaryRepository.save(createDictionaryDto);
      return ApiResult.success<Dictionary>({ data });
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }

  findAll() {
    return `This action returns all dictionary`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dictionary`;
  }

  update(id: number, updateDictionaryDto: UpdateDictionaryDto) {
    return `This action updates a #${id} dictionary`;
  }

  remove(id: number) {
    return `This action removes a #${id} dictionary`;
  }

  async createItem(createDictionaryItemDto: CreateDictionaryItemDto): Promise<ApiResult<DictionaryItem | null>> {
    try {
      let { categoryId, ...option } = createDictionaryItemDto;
      let dictionary = await this.dictionaryRepository.findOne({ where: { id: categoryId } });
      if (!dictionary) {
        return ApiResult.error<null>("字典分类不存在");
      }

      let data = await this.dictionaryItemRepository.save({
        ...option,
        category: dictionary || undefined,
      });
      return ApiResult.success<DictionaryItem>({ data });
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }
}
