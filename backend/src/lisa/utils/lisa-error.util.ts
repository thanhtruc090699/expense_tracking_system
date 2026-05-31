import { Injectable, HttpException, HttpStatus, 
  ServiceUnavailableException, BadGatewayException, 
  BadRequestException, GatewayTimeoutException,
  RequestTimeoutException, UnauthorizedException, ForbiddenException,
  UnprocessableEntityException, InternalServerErrorException } from '@nestjs/common';

  export function handleLisaError(error: any): never {
    const status =
    typeof error?.getStatus === 'function'
      ? error.getStatus()
      : error?.response?.status;

  const response =
    typeof error?.getResponse === 'function'
      ? error.getResponse()
      : error?.response?.data;

  console.error('[LisaService.handleLisaError]', {
    status,
    response,
  });

  if (status === 400) {
    throw new BadRequestException(response || 'Invalid request data');
  }

  if (status === 401) {
    throw new UnauthorizedException('Unauthorized access');
  }

  if (status === 403) {
    throw new ForbiddenException('Forbidden access');
  }

  if (status === 408) {
    throw new RequestTimeoutException('Request timed out');
  }

  if (status === 422) {
    throw new UnprocessableEntityException('Unprocessable entity');
  }

  if (status === 429) {
    throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
  }

  if (status === 503) {
    throw new ServiceUnavailableException('Service is currently unavailable');
  }

  if (status === 504) {
    throw new GatewayTimeoutException('Gateway timed out');
  }

  throw new InternalServerErrorException(
    response || error?.message || 'Internal server error',
  );
}
