export class AdminCouponsError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'AdminCouponsError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class CouponNotFoundError extends AdminCouponsError {
  constructor(couponId: string) {
    super(`Coupon with ID ${couponId} not found`, 'COUPON_NOT_FOUND', 404);
  }
}

export class CouponCodeExistsError extends AdminCouponsError {
  constructor(code: string) {
    super(`Coupon with code ${code} already exists`, 'COUPON_CODE_EXISTS', 409);
  }
}

export class CouponExpiredError extends AdminCouponsError {
  constructor() {
    super('Coupon has expired', 'COUPON_EXPIRED', 400);
  }
}

export class CouponUsageLimitExceededError extends AdminCouponsError {
  constructor() {
    super('Coupon usage limit exceeded', 'COUPON_USAGE_LIMIT_EXCEEDED', 400);
  }
}

export class CouponsFetchError extends AdminCouponsError {
  constructor(message: string = 'Failed to fetch coupons') {
    super(message, 'COUPONS_FETCH_ERROR', 500);
  }
}

export class CouponCreateError extends AdminCouponsError {
  constructor(message: string = 'Failed to create coupon') {
    super(message, 'COUPON_CREATE_ERROR', 500);
  }
}

export class CouponUpdateError extends AdminCouponsError {
  constructor(message: string = 'Failed to update coupon') {
    super(message, 'COUPON_UPDATE_ERROR', 500);
  }
}

export class CouponDeleteError extends AdminCouponsError {
  constructor(message: string = 'Failed to delete coupon') {
    super(message, 'COUPON_DELETE_ERROR', 500);
  }
}