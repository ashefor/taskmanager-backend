import { Controller, Get, Param } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityScope } from './activity-log.entity';

@Controller('activity-log')
export class ActivityLogController {
    
    constructor(private readonly activityLogService: ActivityLogService) { }

    @Get(':scope/:scope_identifier')
    async getEntityLogs(
        @Param('scope') scope: ActivityScope,
        @Param('scope_identifier') scope_identifier: string,
    ) {
        return this.activityLogService.getEntityLogs(scope, scope_identifier);
    }

    @Get('user/:userId')
    async getUserLogs(@Param('userId') userId: string) {
        return this.activityLogService.getUserLogs(userId);
    }
}
