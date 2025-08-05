import * as XLSX from "xlsx";

/**
 * 按key-value格式导出Excel
 * @param data 原始数据数组
 * @param headerMap 表头映射 {实际字段名: 显示名称}
 * @param fileName 导出文件名(默认'export')
 * @param sheetName 工作表名(默认'Sheet1')
 * @returns 包含文件名和Buffer的对象
 */
export function exportWithKeyValueHeader(
  data: any[],
  headerMap: Record<string, string>,
  fileName: string = "export",
  sheetName: string = "Sheet1"
): { buffer: Buffer; fileName: string } {
  // 添加.xlsx后缀（如果用户没有提供）
  const finalFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;

  // 转换数据格式
  const formattedData = data.map((item) => {
    const newItem: Record<string, any> = {};
    Object.keys(headerMap).forEach((key) => {
      newItem[`${headerMap[key]}`] = item[key];
    });
    return newItem;
  });

  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return {
    buffer: XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
    fileName: finalFileName,
  };
}

/**
 * 解析带key-value表头的Excel
 * @param fileBuffer Excel文件Buffer
 * @param headerMap 表头映射 {显示名称: 实际字段名}
 * @param sheetName 工作表名(可选)
 * @returns 标准化JSON数据
 */
export function importWithKeyValueHeader(
  fileBuffer: Buffer,
  headerMap: Record<string, string>,
  sheetName?: string
): any[] {
  // 读取Excel
  const workbook = XLSX.read(fileBuffer);
  const targetSheetName = sheetName || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[targetSheetName];

  // 获取原始数据
  const rawData = XLSX.utils.sheet_to_json(worksheet);

  // 转换数据格式
  return rawData.map((item: any) => {
    const newItem: Record<string, any> = {};
    Object.keys(item).forEach((key) => {
      // 提取原始字段名(去掉显示名称)
      const [originalKey] = key.split(":");
      const mappedKey = headerMap[originalKey] || originalKey;
      newItem[mappedKey] = item[key];
    });
    return newItem;
  });
}

// // 1. 定义表头映射
// const headerMap = {
//   id: 'ID',
//   name: '姓名',
//   age: '年龄'
// };

// // 2. 准备数据
// const data = [
//   { id: 1, name: '张三', age: 25 },
//   { id: 2, name: '李四', age: 30 }
// ];

// // 3. 导出Excel
// const excelBuffer = exportWithKeyValueHeader(data, headerMap, '员工数据');

// // 4. 导入Excel
// const importedData = importWithKeyValueHeader(excelBuffer, {
//   'ID': 'id',
//   '姓名': 'name',
//   '年龄': 'age'
// });

// console.log(importedData);
// // 输出: [{id: 1, name: "张三", age: 25}, {id: 2, name: "李四", age: 30}]
