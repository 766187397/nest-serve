import { Controller, Get, Param, Res } from "@nestjs/common";
import { Knife4jService } from "./knife4j.service";
import { Response } from "express"; // 导入 Express 的 Response 类型
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("接口文档")
@Controller("")
export class Knife4jController {
  constructor(private readonly knife4jService: Knife4jService) {}

  @Get("json")
  @ApiOperation({ summary: "获取 Swagger JSON" })
  getSwagger() {
    return this.knife4jService.getSwagger();
  }

  @Get("download")
  @ApiOperation({ summary: "下载 Swagger JSON" })
  download(@Res({ passthrough: true }) res: Response) {
    let swaggerJson = this.knife4jService.getSwagger();
    // 设置响应头，告诉浏览器这是一个附件（即文件下载）
    res.set({
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=swagger.json",
    });

    // 如果你想要直接发送 JSON 字符串而不是从文件系统读取，可以这样做：
    return JSON.stringify(swaggerJson.data);
  }

  @Get("v3/api-docs/swagger-config")
  @ApiOperation({ summary: "knife4j 接口文档配置" })
  getSwaggerConfig(@Res({ passthrough: true }) res: Response) {
    let swaggerDocs = this.knife4jService.getSwagger().data;
    const groups = [
      {
        name: "全部",
        location: `/api-docs/全部`,
        url: `/api-docs/全部`,
        swaggerVersion: "3.0.0",
        servicePath: "",
      },
    ];

    // 遍历所有路径，提取分组信息
    const uniqueTags = new Set();
    for (const path in swaggerDocs.paths) {
      const pathObject = swaggerDocs.paths[path];
      for (const method in pathObject) {
        const operation = pathObject[method];
        if (operation && operation.tags) {
          operation.tags.forEach((tag: string) => {
            uniqueTags.add(tag);
          });
        }
      }
    }

    // 生成分组资源
    uniqueTags.forEach((tag) => {
      groups.push({
        name: tag as string,
        location: `/api-docs/${tag}`,
        url: `/api-docs/${tag}`,
        swaggerVersion: "3.0.0",
        servicePath: "",
      });
    });
    swaggerDocs.urls = groups;
    res.setHeader("Content-Type", "application/json");
    return swaggerDocs
  }

  @Get("swagger-resources")
  @ApiOperation({ summary: "knife4j 接口文档配置" })
  getSwaggerResources(@Res({ passthrough: true }) res: Response) {
    let swaggerDocs = this.knife4jService.getSwagger().data;
    const groups = [
      {
        name: "全部",
        location: `/api-docs/全部`,
        url: `/api-docs/全部`,
        swaggerVersion: "3.0.0",
        servicePath: "",
      },
    ];

    // 遍历所有路径，提取分组信息
    const uniqueTags = new Set();
    for (const path in swaggerDocs.paths) {
      const pathObject = swaggerDocs.paths[path];
      for (const method in pathObject) {
        const operation = pathObject[method];
        if (operation && operation.tags) {
          operation.tags.forEach((tag: string) => {
            uniqueTags.add(tag);
          });
        }
      }
    }

    // 生成分组资源
    uniqueTags.forEach((tag) => {
      groups.push({
        name: tag as string,
        location: `/api-docs/${tag}`,
        url: `/api-docs/${tag}`,
        swaggerVersion: "3.0.0",
        servicePath: "",
      });
    });

    res.json(groups);
  }

  @Get("api-docs/:groupName")
  @ApiOperation({ summary: "knife4j 分组接口文档" })
  getSwaggerByGroup(@Param("groupName") groupName: string) {
    let swaggerJson = this.knife4jService.getSwagger();
    let swaggerDocs = swaggerJson.data;
    let paths = swaggerDocs.paths;
    let groupPaths = {};
    if (groupName === "全部") {
      return swaggerDocs;
    }
    for (let path in paths) {
      let pathObject = paths[path];
      for (let method in pathObject) {
        let operation = pathObject[method];
        if (operation && operation.tags && operation.tags.includes(groupName)) {
          groupPaths[path] = groupPaths[path] || {};
          groupPaths[path][method] = operation;
        }
      }
    }
    swaggerDocs.paths = groupPaths;
    return swaggerDocs;
  }
}
