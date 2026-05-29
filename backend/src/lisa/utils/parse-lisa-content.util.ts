import { InternalServerErrorException } from '@nestjs/common';

export function parseLisaContent<T = unknown>(content: string): T {
    try {
        const cleaned = content
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

        return JSON.parse(cleaned) as T;
    } catch (error) {
        throw new InternalServerErrorException('Failed to parse Lisa content');
    }
}