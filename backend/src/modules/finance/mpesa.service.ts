import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MpesaService {
    private readonly logger = new Logger(MpesaService.name);

    constructor(private configService: ConfigService) { }

    private get mpesaConfig() {
        return {
            consumerKey: this.configService.get<string>('MPESA_CONSUMER_KEY'),
            consumerSecret: this.configService.get<string>('MPESA_CONSUMER_SECRET'),
            shortCode: this.configService.get<string>('MPESA_SHORTCODE'),
            passKey: this.configService.get<string>('MPESA_PASSKEY'),
            callbackUrl: this.configService.get<string>('MPESA_CALLBACK_URL'),
            env: this.configService.get<string>('MPESA_ENVIRONMENT', 'sandbox'),
        };
    }

    private get baseUrl() {
        return this.mpesaConfig.env === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    async getAccessToken(): Promise<string> {
        const { consumerKey, consumerSecret } = this.mpesaConfig;
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

        try {
            const response = await axios.get(
                `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                },
            );
            return response.data.access_token;
        } catch (error) {
            this.logger.error('Failed to get M-Pesa access token', error.response?.data || error.message);
            throw new Error('M-Pesa Authentication Failed');
        }
    }

    async triggerStkPush(amount: number, phoneNumber: string, accountRef: string, desc: string) {
        const accessToken = await this.getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const { shortCode, passKey, callbackUrl } = this.mpesaConfig;

        const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');

        // Format phone: 2547XXXXXXXX
        const formattedPhone = phoneNumber.startsWith('0')
            ? `254${phoneNumber.slice(1)}`
            : phoneNumber.startsWith('+')
                ? phoneNumber.slice(1)
                : phoneNumber;

        const payload = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(amount),
            PartyA: formattedPhone,
            PartyB: shortCode,
            PhoneNumber: formattedPhone,
            CallBackURL: callbackUrl,
            AccountReference: accountRef,
            TransactionDesc: desc,
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );
            return response.data;
        } catch (error) {
            this.logger.error('STK Push Trigger Failed', error.response?.data || error.message);
            throw new Error('STK Push Failed');
        }
    }
}
