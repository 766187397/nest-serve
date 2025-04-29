import * as bcrypt from "bcrypt";

export class BcryptService {
  // 不要设置这个值太多，测试环4左右即可，生产环境设置为10-12（这个值越大越耗时间）
  private readonly saltRounds = global.envFilePath == "prod" ? 10 : 4;

  /**
   * 哈希加密
   * @param {string} str 需要加密的内容
   * @returns {Promise<string>} 加密后的内容
   */
  async encryptStr(str: string): Promise<string> {
    return bcrypt.hash(str, this.saltRounds);
  }
  /**
   * 校验对比
   * @param plainStr 明文字符串
   * @param hashedStr 密文字符串
   * @returns {Promise<boolean>} true/false
   */
  async validateStr(plainStr: string, hashedStr: string): Promise<boolean> {
    return bcrypt.compare(plainStr, hashedStr);
  }
}

export const bcryptService = new BcryptService();
