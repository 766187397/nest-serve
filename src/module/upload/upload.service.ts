import { Injectable } from "@nestjs/common";
import { ApiResult } from "@/common/utils/result";
import { Upload } from "./entities/upload.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { BaseService } from "@/common/service/base";
import { FileHashDTO, FindFileDto, FindFileDtoByPage } from "./dto/index.dto";
import { UploadFile } from "@/types/upload";
import { PageApiResult } from "@/types/public";

@Injectable()
export class UploadService extends BaseService {
  constructor(
    @InjectRepository(Upload)
    private upload: Repository<Upload>
  ) {
    super();
  }

  /**
   * 文件上传
   * @param file 文件
   * @returns {Promise<ApiResult<UploadFile | null>>} 统一返回结果
   */
  async uploadFile(file: any, hash?: string): Promise<ApiResult<UploadFile | null>> {
    try {
      if (!file) {
        return ApiResult.error("文件不能为空！");
      }
      const fileData = this.upload.create({
        url: "/" + file.path.replace(/\\/g, "/"),
        fileName: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        hash,
      });
      const savedFile = await this.upload.save(fileData);
      return ApiResult.success<UploadFile>({
        data: { ...savedFile, completePath: global.url + "/" + file.path.replace(/\\/g, "/") },
        message: "上传成功",
        code: 200,
        entities: Upload,
      });
    } catch (error) {
      return ApiResult.error<null>(error || "上传失败");
    }
  }

  /**
   * 获取所有文件列表
   * @param {FindFileDto} findFileDto 查询参数
   * @returns {Promise<ApiResult<UploadFile[] | null>>} 统一返回结果
   */
  async getFileAll(findFileDto: FindFileDto): Promise<ApiResult<UploadFile[] | null>> {
    try {
      let where: FindOptionsWhere<Upload> = this.buildCommonQuery(findFileDto);
      let order = this.buildCommonSort(findFileDto?.sort);
      const files = await this.upload.find({
        where: {
          ...where,
          fileName: findFileDto?.fileName ? ILike(`%${findFileDto.fileName}%`) : undefined,
        },
        order,
      });
      const resultData = files.map((file) => {
        return {
          ...file,
          completePath: global.url + file.url,
        };
      });
      return ApiResult.success<UploadFile[]>({
        data: resultData,
        entities: Upload,
      });
    } catch (error) {
      return ApiResult.error<null>(error || "查询失败");
    }
  }

  /**
   * 分页查询文件
   * @param {FindFileDtoByPage} findFileDtoByPage
   * @returns {Promise<ApiResult<PageApiResult<UploadFile[]> | null>>}
   */
  async getFileByPage(
    findFileDtoByPage: FindFileDtoByPage
  ): Promise<ApiResult<PageApiResult<UploadFile[]> | null>> {
    try {
      let where: FindOptionsWhere<Upload> = this.buildCommonQuery(findFileDtoByPage);
      let order = this.buildCommonSort(findFileDtoByPage?.sort);
      const { take, skip } = this.buildCommonPaging(findFileDtoByPage.page, findFileDtoByPage.pageSize);
      const [data, total] = await this.upload.findAndCount({
        where: {
          ...where,
          fileName: findFileDtoByPage?.fileName ? ILike(`%${findFileDtoByPage.fileName}%`) : undefined,
        },
        order,
        skip,
        take,
      });
      const resultData = data.map((file) => {
        const { deletedAt, platform, ...item } = file;
        return {
          ...item,
          createdAt: this.dayjs(file.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: this.dayjs(file.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
          completePath: global.url + file.url,
        };
      });
      // 计算总页数
      const totalPages = Math.ceil(total / take);
      return ApiResult.success<PageApiResult<UploadFile[]>>({
        data: {
          data: resultData,
          total,
          totalPages,
          page: findFileDtoByPage?.page || 1,
          pageSize: findFileDtoByPage?.pageSize || 10,
        },
        message: "查询成功",
        code: 200,
        entities: Upload,
      });
    } catch (error) {
      return ApiResult.error<null>(error || "查询失败");
    }
  }

  /**
   * 通过 ID 查询文件
   * @param id 文件ID
   * @returns {Promise<ApiResult<UploadFile | null>>} 统一返回结果
   */
  async getFileById(id: string): Promise<ApiResult<UploadFile | null>> {
    try {
      const file = await this.upload.findOne({ where: { id } });
      if (!file) {
        return ApiResult.error("文件不存在");
      }
      return ApiResult.success<UploadFile>({
        data: {
          ...file,
          completePath: global.url + file.url,
        },
        message: "查询成功",
        entities: Upload,
      });
    } catch (error) {
      return ApiResult.error<null>(error || "查询失败");
    }
  }

  /**
   * 删除文件
   * @param id 文件ID
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async deleteFileById(id: string): Promise<ApiResult<null>> {
    try {
      await this.upload.softDelete(id);
      return ApiResult.success<null>({
        data: null,
        message: "删除成功",
        entities: Upload,
      });
    } catch (error) {
      return ApiResult.error<null>(error || "删除失败");
    }
  }

  /**
   * 查询文件通过 hash 值和文件大小
   * @param fileHashDTO  hash 值和文件大小
   * @returns {Promise<ApiResult<UploadFile | null>>} 统一返回结果
   */
  async getFileByHash(fileHashDTO: FileHashDTO): Promise<ApiResult<UploadFile | null>> {
    try {
      let file = await this.upload.findOne({
        where: {
          hash: fileHashDTO.hash,
          size: fileHashDTO.size,
        },
      });

      let data: UploadFile | null = null;
      if (file) {
        data = {
          ...file,
          completePath: file ? global.url + file.url : "",
        };
      }

      return ApiResult.success<UploadFile | null>({
        data: data,
        message: "操作成功",
        entities: Upload,
      });
    } catch (error) {
      return ApiResult.error<null>(error || "操作失败");
    }
  }
}
