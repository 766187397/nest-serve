import { Injectable } from "@nestjs/common";
import { ChatRequestDto, CreateImageDto } from "./dto/index";
import axios from "axios";
import { ApiResult } from "@/common/utils/result";

@Injectable()
export class ChataiService {
  // 根地址
  private apiUrl = "https://api.siliconflow.cn/v1";
  // 令牌
  private token = "sk-juvmujpudzldezfndvydlgmtzrabjiindrmlrbyifhmytxkz";
  /**
   * 对话接口
   * @param {ChatRequestDto} message 消息
   * @returns {Promise<ApiResult<any>>} 响应结果
   */
  async chat(message: ChatRequestDto): Promise<ApiResult<any>> {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      data: {
        model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
        messages: message.messages,
      },
    };

    try {
      const response = await axios.post(this.apiUrl + "/chat/completions", options.data, {
        headers: options.headers,
      });
      return ApiResult.success({
        data: response.data,
      });
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
      const response = await axios.post(this.apiUrl + "/images/generations", options.data, {
        headers: options.headers,
      });
      return ApiResult.success({
        data: response.data,
      });
    } catch (error) {
      return ApiResult.error(error);
    }
  }
}
