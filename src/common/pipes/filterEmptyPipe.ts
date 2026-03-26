import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * 空值过滤配置选项
 */
export interface FilterEmptyOptions {
  /** 是否过滤空字符串 ''，默认：true */
  emptyString?: boolean;
  /** 是否过滤 null，默认：true */
  null?: boolean;
  /** 是否过滤 undefined，默认：true */
  undefined?: boolean;
  /** 是否过滤空数组 []，默认：false */
  emptyArray?: boolean;
  /** 是否过滤空对象 {}，默认：false */
  emptyObject?: boolean;
  /** 是否过滤 NaN，默认：false */
  nan?: boolean;
  /** 是否过滤 0，默认：false */
  zero?: boolean;
  /** 是否过滤 false，默认：false */
  false?: boolean;
}

/**
 * 过滤空值管道
 * 支持配置化过滤各种空值类型
 */
@Injectable()
export class FilterEmptyPipe implements PipeTransform {
  private readonly options: FilterEmptyOptions;

  /**
   * 构造函数
   * @param options 过滤配置选项
   */
  constructor(options: FilterEmptyOptions = {}) {
    // 默认配置：过滤空字符串、null、undefined
    this.options = {
      emptyString: true,
      null: true,
      undefined: true,
      emptyArray: false,
      emptyObject: false,
      nan: false,
      zero: false,
      false: false,
      ...options,
    };
  }

  /**
   * 检查值是否为空
   * @param value 要检查的值
   * @returns 是否为空值
   */
  private isEmpty(value: unknown): boolean {
    // 检查 undefined
    if (value === undefined && this.options.undefined) {
      return true;
    }

    // 检查 null
    if (value === null && this.options.null) {
      return true;
    }

    // 检查空字符串
    if (value === '' && this.options.emptyString) {
      return true;
    }

    // 检查 NaN
    if (Number.isNaN(value) && this.options.nan) {
      return true;
    }

    // 检查 false
    if (value === false && this.options.false) {
      return true;
    }

    // 检查 0
    if (value === 0 && this.options.zero) {
      return true;
    }

    // 检查空数组
    if (Array.isArray(value) && this.options.emptyArray) {
      return value.length === 0;
    }

    // 检查空对象
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      this.options.emptyObject
    ) {
      return Object.keys(value).length === 0;
    }

    return false;
  }

  /**
   * 转换方法
   * @param value 输入值
   * @param metadata 参数元数据
   * @returns 过滤后的值
   */
  transform<T>(value: T, metadata: ArgumentMetadata): T {
    // 如果是基本类型，直接检查是否为空
    if (typeof value !== 'object' || value === null) {
      return this.isEmpty(value) ? (undefined as unknown as T) : value;
    }

    // 处理数组
    if (Array.isArray(value)) {
      return value
        .map((item) => this.transform(item, metadata))
        .filter((item) => !this.isEmpty(item)) as unknown as T;
    }

    // 处理对象
    const result = {} as T;
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      // 递归处理嵌套值
      const transformedValue = this.transform(val, metadata);
      // 只有非空值才保留
      if (!this.isEmpty(transformedValue)) {
        (result as Record<string, unknown>)[key] = transformedValue;
      }
    }
    return result;
  }
}
