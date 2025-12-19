import sanitizeHtml from 'sanitize-html';
import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class SanitizeHtmlPipe implements PipeTransform {
  transform(value: any) {
    if (value && typeof value === 'object') {
      if (value.description) {
        value.description = sanitizeHtml(value.description);
      }
    }
    return value;
  }
}