import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { ActivityScope } from './activity-log.entity';

@ApiTags('activity-log')
@ApiBearerAuth()
@Controller('activity-log')
export class ActivityLogController {
    
    constructor(private readonly activityLogService: ActivityLogService) { }

    @Get(':scope/:scope_identifier')
    @ApiOperation({ summary: 'Get activity logs for a specific entity' })
    @ApiParam({
        name: 'scope',
        description: 'Type of entity (e.g., task, user)',
        enum: ActivityScope,
        example: 'task',
    })
    @ApiParam({
        name: 'scope_identifier',
        description: 'UUID of the entity',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiResponse({
        status: 200,
        description: 'Activity logs fetched successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Entity not found' })
    async getEntityLogs(
        @Param('scope') scope: ActivityScope,
        @Param('scope_identifier') scope_identifier: string,
    ) {
        return this.activityLogService.getEntityLogs(scope, scope_identifier);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get activity logs for a specific user' })
    @ApiParam({
        name: 'userId',
        description: 'UUID of the user',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiResponse({
        status: 200,
        description: 'User activity logs fetched successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserLogs(@Param('userId') userId: string) {
        return this.activityLogService.getUserLogs(userId);
    }
}
