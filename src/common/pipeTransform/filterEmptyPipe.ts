import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

interface FilteredValue {
  [key: string]: unknown;
}

/** 过滤空值：空字符串、null、undefined */
@Injectable()
export class FilterEmptyPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).reduce((acc: FilteredValue, key) => {
        if (value[key] !== '' && value[key] !== null && value[key] !== undefined) {
          acc[key] = this.transform(value[key], metadata);
        }
        return acc;
      }, {});
    }
    return value;
  }
}
