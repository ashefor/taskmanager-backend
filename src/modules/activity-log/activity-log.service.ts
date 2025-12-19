import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity, ActivityScope, ActivityType } from './activity-log.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { getEntityDiff } from 'src/common/utils/diff.util';

@Injectable()
export class ActivityLogService {
    constructor(
        @InjectRepository(Activity)
        private readonly activityRepository: Repository<Activity>,
    ) { }

    async logActivity(
        scope: ActivityScope,
        scope_identifier: string,
        action: ActivityType,
        user: User | null,
        details?: string,
        before?: Record<string, any>,
        after?: Record<string, any>,
    ) {
        let changes;
        if (before && after) {
            changes = getEntityDiff(before, after) || null;
        }
        // const user: User = this.request.user;

        const log = this.activityRepository.create({
            scope,
            scope_identifier,
            action,
            details,
            ...(changes && { changes }),
            ...(user && { performedBy: user }),
        });
        return this.activityRepository.save(log);
    }

    async getEntityLogs(scope: ActivityScope, scope_identifier: string) {
        return this.activityRepository.find({
            where: { scope, scope_identifier },
            order: { createdAt: 'DESC' },
        });
    }

    async getUserLogs(userId: string) {
        return this.activityRepository.find({
            where: { performedBy: { uuid: userId } },
            order: { createdAt: 'DESC' },
        });
    }
}
