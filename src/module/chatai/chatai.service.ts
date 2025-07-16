import { Injectable } from "@nestjs/common";
import { ChatRequestDto, CreateImageDto } from "./dto/index";
import axios from "axios";
import { ApiResult } from "@/common/utils/result";
import { BaseService } from "@/common/service/base";
import { InjectRepository } from "@nestjs/typeorm";
import { Chatai } from "./entities/chatai.entity";
import { Repository } from "typeorm";

@Injectable()
export class ChataiService extends BaseService {
  constructor(
    @InjectRepository(Chatai)
    private chataiRepository: Repository<Chatai>
  ) {
    super();
  }

  // 根地址
  private apiUrl = "https://api.siliconflow.cn/v1";
  // 令牌
  private token = "sk-juvmujpudzldezfndvydlgmtzrabjiindrmlrbyifhmytxkz";
  /**
   * 对话接口
   * @param {ChatRequestDto} message 消息
   * @param {string} platform 平台
   * @returns {Promise<ApiResult<any>>} 响应结果
   */
  async chat(message: ChatRequestDto, platform: string = "admin"): Promise<ApiResult<any>> {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      data: {
        model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
        messages: message.messages,
        max_tokens: 8192,
      },
    };

    try {
      const { data } = await axios.post(this.apiUrl + "/chat/completions", options.data, {
        headers: options.headers,
      });
      let userData = message.messages.at(-1);
      // 对话记录
      let content: any[] = [];
      let record = this.chataiRepository.create({ platform });
      if (message.id) {
        let res = await this.chataiRepository.findOne({ where: { id: message.id } });
        if (res) {
          record = res;
        }
      }
      content = record.content ? (JSON.parse(record.content) as any[]) : [];
      content.push(userData);
      content.push(data.choices.at(-1).message);
      record.content = JSON.stringify(content);
      await this.chataiRepository.save(record);

      return ApiResult.success({ data });
    } catch (error) {
      return ApiResult.error(error);
    }
  }

  /**
   * 生成图片
   * @param {CreateImageDto} message
   * @returns {Promise<ApiResult<any>>} 响应结果
   */
  async createImages(message: CreateImageDto): Promise<ApiResult<any>> {
    const options = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      data: {
        model: "Kwai-Kolors/Kolors",
        ...message,
      },
    };

    try {
      const { data } = await axios.post(this.apiUrl + "/images/generations", options.data, {
        headers: options.headers,
      });
      return ApiResult.success({ data });
    } catch (error) {
      return ApiResult.error(error);
    }
  }

  /**
   * 获取对话记录
   * @param {string} id 记录id
   * @returns {Promise<ApiResult<Chatai | null>>} 响应结果
   */
  async findOne(id: string): Promise<ApiResult<Chatai | null>> {
    try {
      let data = await this.chataiRepository.findOne({ where: { id } });
      return ApiResult.success({ data });
    } catch (error) {
      return ApiResult.error(error);
    }
  }
}
