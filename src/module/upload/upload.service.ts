import { Injectable } from "@nestjs/common";
import { ApiResult } from "@/common/utils/result";
import { Upload } from "./entities/upload.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { BaseService } from "@/common/service/base";
import { FindFileDto, FindFileDtoByPage } from "./dto/index.dto";

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
   */
  async uploadFile(file: any) {
    try {
      if (!file) {
        return ApiResult.error("文件不能为空！");
      }
      // const port = process.env.PORT || 3000;
      // const host = process.env.HOST || "localhost";
      // const url = `http://${host}:${port}`;
      const savedFile = await this.upload.save({
        url: "/" + file.path.replace(/\\/g, "/"),
        fileName: file.filename,
        size: file.size,
      });
      return ApiResult.success({
        data: { ...savedFile, completePath: global.url + "/" + file.path.replace(/\\/g, "/") },
        message: "上传成功",
        code: 200,
        entities: Upload,
      });
    } catch (error) {
      return ApiResult.error(error || "上传失败");
    }
  }

  /**
   * 获取所有文件列表
   */
  async getFileAll(findFileDto: FindFileDto) {
    try {
      let where: FindOptionsWhere<Upload> = this.buildCommonQuery(findFileDto);
      let order = this.buildCommonSort(findFileDto);
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
      return ApiResult.success({
        data: resultData,
        message: "查询成功",
        code: 200,
        entities: Upload,
      });
    } catch (error) {
      return ApiResult.error(error || "查询失败");
    }
  }

  /**
   * 分页查询文件
   * @param page 页码
   * @param pageSize 数量
   */
  async getFileByPage(findFileDtoByPage: FindFileDtoByPage) {
    try {
      let where: FindOptionsWhere<Upload> = this.buildCommonQuery(findFileDtoByPage);
      let order = this.buildCommonSort(findFileDtoByPage);
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
        return {
          ...file,
          completePath: global.url + file.url,
        };
      });
      return ApiResult.success({
        data: { resultData, total },
        message: "查询成功",
        code: 200,
      });
    } catch (error) {
      return ApiResult.error(error || "查询失败");
    }
  }

  /**
   * 通过 ID 查询文件
   * @param id 文件ID
   */
  async getFileById(id: number) {
    try {
      const file = await this.upload.findOne({ where: { id } });
      if (!file) {
        return ApiResult.error("文件不存在");
      }
      return ApiResult.success({
        data: {
          ...file,
          completePath: global.url + file.url,
        },
        message: "查询成功",
        entities: Upload,
      });
    } catch (error) {
      return ApiResult.error(error || "查询失败");
    }
  }

  /**
   * 删除文件
   * @param id 文件ID
   */
  async deleteFileById(id: number) {
    try {
      await this.upload.softDelete(id);
      return ApiResult.success({
        data: null,
        message: "删除成功",
        entities: Upload,
      });
    } catch (error) {
      return ApiResult.error(error || "删除失败");
    }
  }
}
