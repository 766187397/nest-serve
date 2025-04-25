// class-validator 的校验比较单一，有的时候需要校验多种类型，需要自定义函数
import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

export function IsStringOrNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isStringOrNumber",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === "string" || typeof value === "number";
        },
        defaultMessage(validationArguments?: ValidationArguments): string {
          return "字段必须是字符串或数字";
        },
      },
    });
  };
}
