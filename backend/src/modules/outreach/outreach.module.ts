import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrisisRequest } from './entities/crisis-request.entity';
import { GrowthCentre, GrowthCentreAttendance } from './entities/growth-centre.entity';
import { LifeMilestone } from '../spiritual/entities/life-milestone.entity';
import { PrayerRequest } from '../spiritual/entities/prayer-request.entity';
import { GrowthTrack, GrowthTrackCompletion } from '../spiritual/entities/growth-track.entity';
import { Hymn, SermonNote } from '../worship/entities/worship.entity';
import { LiveService } from '../worship/entities/live-service.entity';
import { User } from '../users/entities/user.entity';
import { OutreachSite } from './entities/outreach-site.entity';
import { CrisisService } from './crisis.service';
import { CrisisController } from './crisis.controller';

@Module({
    imports: [TypeOrmModule.forFeature([
        CrisisRequest,
        GrowthCentre,
        GrowthCentreAttendance,
        LifeMilestone,
        PrayerRequest,
        GrowthTrack,
        GrowthTrackCompletion,
        Hymn,
        SermonNote,
        LiveService,
        User,
        OutreachSite
    ])],
    controllers: [CrisisController],
    providers: [CrisisService],
    exports: [CrisisService],
})
export class OutreachModule { }
