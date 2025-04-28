import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";

/** 过滤空值：空字符串、null、undefined */
@Injectable()
export class FilterEmptyPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === "object") {
      return Object.keys(value).reduce((acc, key) => {
        if (value[key] !== "" && value[key] !== null && value[key] !== undefined) {
          acc[key] = this.transform(value[key], metadata);
        }
        return acc;
      }, {});
    }
    return value;
  }
}
