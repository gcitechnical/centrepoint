import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CrisisRequest, CrisisStatus } from './entities/crisis-request.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CrisisService {
    private readonly logger = new Logger(CrisisService.name);

    constructor(
        @InjectRepository(CrisisRequest)
        private crisisRepository: Repository<CrisisRequest>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async reportCrisis(data: any, user: User): Promise<CrisisRequest> {
        const crisis: CrisisRequest = this.crisisRepository.create({
            ...data,
            tenant_id: user.tenant_id,
            reported_by_id: user.id,
            status: CrisisStatus.REPORTED,
        });
        this.logger.log(`New Crisis Reported: ${data.category} by ${user.first_name}`);
        return await this.crisisRepository.save(crisis) as any;
    }

    async findAllActive(tenantId: string): Promise<CrisisRequest[]> {
        return await this.crisisRepository.find({
            where: { tenant_id: tenantId, status: In([CrisisStatus.REPORTED, CrisisStatus.ASSESSED, CrisisStatus.MOBILIZING]) },
            relations: ['reported_by'],
            order: { created_at: 'DESC' },
        });
    }

    /**
     * THE EXTENDED FAMILY ENGINE
     * Matches profession/skills of members to the crisis category
     */
    async matchServiceProviders(crisisId: string) {
        const crisis = await this.crisisRepository.findOne({ where: { id: crisisId } });
        if (!crisis) throw new Error('Crisis not found');

        let searchTerms: string[] = [];
        if (crisis.category === 'medical') searchTerms = ['Doctor', 'Nurse', 'Medic', 'Pharmacist'];
        if (crisis.category === 'legal') searchTerms = ['Lawyer', 'Advocate', 'Legal'];
        if (crisis.category === 'bereavement') searchTerms = ['Counselor', 'Welfare', 'Pastor'];

        return await this.userRepository.createQueryBuilder('user')
            .where('user.tenant_id = :tenantId', { tenantId: crisis.tenant_id })
            .andWhere('(user.profession IN (:...terms) OR user.skills && :skills)', {
                terms: searchTerms,
                skills: searchTerms
            })
            .getMany();
    }

    async updateStatus(id: string, status: CrisisStatus, notes?: string) {
        return await this.crisisRepository.update(id, {
            status,
            assessment_notes: notes || undefined
        } as any);
    }
}
