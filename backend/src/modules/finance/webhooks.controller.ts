import { Controller, Post, Body, Logger } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(private readonly financeService: FinanceService) { }

    @Public()
    @Post('mpesa')
    async mpesaCallback(@Body() payload: any) {
        this.logger.log('Received M-Pesa Callback');
        return await this.financeService.handleMpesaCallback(payload);
    }
}
