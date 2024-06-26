import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthCheckService {
  check() {
    return {
      healthy: true,
      name: 'API',
      version: process.env.npm_package_version,
    };
  }
}
