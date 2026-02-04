import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl } = req;
    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const logsDir = path.join(process.cwd(), 'logs');
      try {
        if (!fs.existsSync(logsDir)) {
          fs.mkdirSync(logsDir, { recursive: true });
        }
        const logFile = path.join(logsDir, 'app.log');
        const line = `[HTTP] ${method} ${originalUrl} ${status} ${duration}ms\n`;
        fs.appendFile(logFile, line, () => {});
      } catch {}
    });
    next();
  }
}
