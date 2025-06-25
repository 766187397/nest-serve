import { Injectable } from "@nestjs/common";
import {
  CreateDictionaryDto,
  CreateDictionaryItemDto,
  FindDictionaryDto,
  FindDictionaryDtoByPage,
  FindDictionaryItemDto,
  FindDictionaryItemDtoByPage,
  UpdateDictionaryDto,
  UpdateDictionaryItemDto,
} from "./dto";
import { BaseService } from "@/common/service/base";
import { Dictionary } from "./entities/dictionary.entity";
import { DictionaryItem } from "./entities/dictionaryItem.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Not, Repository } from "typeorm";
import { ApiResult } from "@/common/utils/result";
import { PageApiResult } from "@/types/public";

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

  /**
   * 创建字典分类
   * @param {CreateDictionaryDto} createDictionaryDto   创建字典分类DTO
   * @returns {Promise<ApiResult<Dictionary | null>>}   统一返回结果
   */
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

  /**
   * 分页查询字典分类
   * @param {FindDictionaryDtoByPage} findDictionaryDtoByPage   查询字典分类DTO
   * @returns {Promise<ApiResult<PageApiResult<Dictionary[]> | null>>}   统一返回结果
   */
  async findByPage(
    findDictionaryDtoByPage: FindDictionaryDtoByPage
  ): Promise<ApiResult<PageApiResult<Dictionary[]> | null>> {
    try {
      let where = this.buildCommonQuery(findDictionaryDtoByPage);
      let order = this.buildCommonSort(findDictionaryDtoByPage?.sort);
      let { skip, take } = this.buildCommonPaging(findDictionaryDtoByPage.page, findDictionaryDtoByPage.pageSize);
      let [data, total] = await this.dictionaryRepository.findAndCount({
        where: {
          ...where,
          name: findDictionaryDtoByPage?.name ? ILike(`%${findDictionaryDtoByPage.name}%`) : undefined,
        },
        order,
        take,
        skip,
      });
      // 计算总页数
      const totalPages = Math.ceil(total / take);
      return ApiResult.success<PageApiResult<Dictionary[]>>({
        data: {
          data,
          total,
          totalPages,
          page: findDictionaryDtoByPage?.page || 1,
          pageSize: findDictionaryDtoByPage?.pageSize || 10,
        },
      });
    } catch (error) {
      return ApiResult.error<null>(error || "字典查询失败，请稍后再试");
    }
  }

  /**
   * 查询所有字典分类
   * @param {FindDictionaryDto} findDictionaryDto   查询条件
   * @returns
   */
  async findAll(findDictionaryDto: FindDictionaryDto): Promise<ApiResult<Dictionary[] | null>> {
    try {
      let where = this.buildCommonQuery(findDictionaryDto);
      let order = this.buildCommonSort(findDictionaryDto?.sort);
      let data = await this.dictionaryRepository.find({
        where: {
          ...where,
          name: findDictionaryDto?.name ? ILike(`%${findDictionaryDto.name}%`) : undefined,
        },
        order,
      }); // 查询所有字典分类并返回;
      return ApiResult.success<Dictionary[]>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "字典查询失败，请稍后再试");
    }
  }

  /**
   * 查询单个字典分类
   * @param {string} id   id
   * @returns {Promise<ApiResult<Dictionary | null>>}    统一返回结果
   */
  async findOne(id: string): Promise<ApiResult<Dictionary | null>> {
    try {
      let data = await this.dictionaryRepository.findOne({ where: { id } });
      return ApiResult.success<Dictionary>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "字典查询失败，请稍后再试");
    }
  }

  /**
   * 更新字典分类
   * @param {string} id   id
   * @param {UpdateDictionaryDto} updateDictionaryDto   更新字典分类DTO
   * @returns {Promise<ApiResult<null>>}   统一返回结果
   */
  async update(id: string, updateDictionaryDto: UpdateDictionaryDto): Promise<ApiResult<null>> {
    try {
      const exist = await this.dictionaryRepository.findOne({
        where: { id: Not(id), type: updateDictionaryDto?.type },
      });
      if (exist) {
        return ApiResult.error<null>("字典类型已存在");
      }
      await this.dictionaryRepository.update(id, updateDictionaryDto);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>(error || "字典更新失败，请稍后再试");
    }
  }

  /**
   * 删除字段分类
   * @param {string} id   id
   * @returns {Promise<ApiResult<null>>}   统一返回结果
   */
  async remove(id: string): Promise<ApiResult<null>> {
    try {
      let dictionary = await this.dictionaryRepository.findOneBy({ id });
      if (!dictionary) {
        return ApiResult.error<null>("字典不存在");
      } else {
        let dictionaryItem = await this.dictionaryItemRepository.find({
          where: { category: dictionary },
        });
        if (dictionaryItem) {
          dictionaryItem.forEach(async (item) => {
            await this.dictionaryItemRepository.softDelete(item.id);
          });
        }
      }
      await this.dictionaryRepository.softDelete(id);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>(error || "字典删除失败，请稍后再试");
    }
  }

  /**
   * 字段项创建
   * @param {CreateDictionaryItemDto} createDictionaryItemDto   创建字段项DTO
   * @returns {Promise<ApiResult<DictionaryItem | null>>}    统一返回结果
   */
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

  /**
   * 分页查询字典项
   * @param {FindDictionaryItemDtoByPage} findDictionaryItemDtoByPage    查询字典项DTO
   * @returns {Promise<ApiResult<PageApiResult<DictionaryItem[]> | null>>}   统一返回结果
   */
  async findItemByPage(
    findDictionaryItemDtoByPage: FindDictionaryItemDtoByPage
  ): Promise<ApiResult<PageApiResult<DictionaryItem[]> | null>> {
    try {
      let dictionaryId;
      if (findDictionaryItemDtoByPage?.categoryId) {
        dictionaryId = +findDictionaryItemDtoByPage?.categoryId;
      }
      const category = await this.dictionaryRepository.findOne({
        where: { id: dictionaryId, type: findDictionaryItemDtoByPage?.type },
      });
      if (!category) {
        return ApiResult.error<null>("字典分类不存在");
      }
      let where = this.buildCommonQuery(findDictionaryItemDtoByPage);
      let order = this.buildCommonSort(findDictionaryItemDtoByPage?.sort);
      let { skip, take } = this.buildCommonPaging(
        findDictionaryItemDtoByPage.page,
        findDictionaryItemDtoByPage.pageSize
      );
      let [data, total] = await this.dictionaryItemRepository.findAndCount({
        where: {
          ...where,
          label: findDictionaryItemDtoByPage?.label ? ILike(`%${findDictionaryItemDtoByPage.label}%`) : undefined,
          category: {
            id: dictionaryId,
            type: findDictionaryItemDtoByPage?.type,
          },
        },
        order,
        take,
        skip,
      });
      // 计算总页数
      const totalPages = Math.ceil(total / take);
      return ApiResult.success<PageApiResult<DictionaryItem[]>>({
        data: {
          data,
          total,
          totalPages,
          page: findDictionaryItemDtoByPage?.page || 1,
          pageSize: findDictionaryItemDtoByPage?.pageSize || 10,
        },
      });
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }

  /**
   * 查询所有字典项
   * @param {FindDictionaryItemDto} findDictionaryItemDto    查询字典项DTO
   * @returns {Promise<ApiResult<DictionaryItem[] | null>>}   统一返回结果
   */
  async findItemAll(findDictionaryItemDto: FindDictionaryItemDto): Promise<ApiResult<DictionaryItem[] | null>> {
    try {
      let dictionaryId;
      if (findDictionaryItemDto?.categoryId) {
        dictionaryId = +findDictionaryItemDto?.categoryId;
      }
      const category = await this.dictionaryRepository.findOne({
        where: { id: dictionaryId, type: findDictionaryItemDto?.type },
      });
      if (!category) {
        return ApiResult.error<null>("字典分类不存在");
      }
      let where = this.buildCommonQuery(findDictionaryItemDto);
      let order = this.buildCommonSort(findDictionaryItemDto?.sort);
      let data = await this.dictionaryItemRepository.find({
        where: {
          ...where,
          label: findDictionaryItemDto?.label ? ILike(`%${findDictionaryItemDto.label}%`) : undefined,
          category: {
            id: dictionaryId,
            type: findDictionaryItemDto?.type,
          },
        },
        order,
      });
      return ApiResult.success<DictionaryItem[]>({ data });
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }

  /**
   * 通过id查询字典项
   * @param {string} id   id
   * @returns {Promise<ApiResult<DictionaryItem | null>>}    统一返回结果
   */
  async findItemOne(id: string): Promise<ApiResult<DictionaryItem | null>> {
    try {
      let data = await this.dictionaryItemRepository.findOne({
        where: {
          id,
        },
      });
      return ApiResult.success<DictionaryItem>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "字典查询失败，请稍后再试");
    }
  }

  /**
   * 更新字典项
   * @param {string} id   id
   * @param {UpdateDictionaryItemDto} updateDictionaryItemDto   更新字典项DTO
   * @returns {Promise<ApiResult<null>>}   统一返回结果
   */
  async updateItem(id: string, updateDictionaryItemDto: UpdateDictionaryItemDto): Promise<ApiResult<null>> {
    try {
      let data = await this.dictionaryItemRepository.update(id, updateDictionaryItemDto);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>(error || "字典更新失败，请稍后再试");
    }
  }

  /**
   * 删除字典项
   * @param {string} id   id
   * @returns {Promise<ApiResult<null>>}   统一返回结果
   */
  async removeItem(id: string): Promise<ApiResult<null>> {
    try {
      await this.dictionaryItemRepository.softDelete(id);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>(error || "字典删除失败，请稍后再试");
    }
  }
}
