import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BusinessException } from '@/common/exceptions/business.exception';
import { SystemException } from '@/common/exceptions/system.exception';
import { ValidationException } from '@/common/exceptions/validation.exception';
import { PermissionException } from '@/common/exceptions/permission.exception';
import { ErrorCodes } from '@/common/constants/error-codes';

@ApiTags('异常测试')
@Controller('exception-test')
export class ExceptionTestController {
  @Get('business')
  @ApiOperation({ summary: '测试业务异常' })
  testBusinessException() {
    throw new BusinessException(
      ErrorCodes.USER_NOT_FOUND,
      '用户不存在',
      { userId: 123 }
    );
  }

  @Get('system')
  @ApiOperation({ summary: '测试系统异常' })
  testSystemException() {
    throw new SystemException(
      ErrorCodes.DATABASE_CONNECTION_ERROR,
      '数据库连接失败',
      { host: 'localhost', port: 3306 }
    );
  }

  @Get('validation')
  @ApiOperation({ summary: '测试验证异常' })
  testValidationException() {
    throw new ValidationException(
      ErrorCodes.INVALID_EMAIL,
      '邮箱格式不正确',
      { email: 'invalid-email' }
    );
  }

  @Get('permission')
  @ApiOperation({ summary: '测试权限异常' })
  testPermissionException() {
    throw new PermissionException(
      ErrorCodes.PERMISSION_DENIED,
      '权限不足',
      { resource: 'admin', action: 'delete' }
    );
  }

  @Get('error')
  @ApiOperation({ summary: '测试普通Error' })
  testError() {
    throw new Error('这是一个普通错误');
  }

  @Post('sensitive-data')
  @ApiOperation({ summary: '测试敏感数据过滤' })
  testSensitiveData(@Body() body: { username: string; password: string; token: string }) {
    throw new Error(`用户 ${body.username} 的密码是 ${body.password}，token是 ${body.token}`);
  }
}
