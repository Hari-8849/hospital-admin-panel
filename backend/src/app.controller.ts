import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('application')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Get application status' })
  @ApiResponse({
    status: 200,
    description: 'Application is running successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Hospital Management API is running' },
        version: { type: 'string', example: '1.0.0' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  getRoot() {
    return {
      message: 'Hospital Management API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}