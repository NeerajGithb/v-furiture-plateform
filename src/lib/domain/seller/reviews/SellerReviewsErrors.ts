export class SellerReviewsError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "SellerReviewsError";
  }
}

export class ReviewNotFoundError extends SellerReviewsError {
  constructor(reviewId?: string) {
    super(
      reviewId ? `Review with ID ${reviewId} not found` : "Review not found",
      "REVIEW_NOT_FOUND",
      404,
    );
  }
}

export class UnauthorizedReviewAccessError extends SellerReviewsError {
  constructor() {
    super(
      "You are not authorized to access this review",
      "UNAUTHORIZED_REVIEW_ACCESS",
      403,
    );
  }
}

export class ReviewAlreadyRespondedError extends SellerReviewsError {
  constructor() {
    super(
      "This review has already been responded to",
      "REVIEW_ALREADY_RESPONDED",
      400,
    );
  }
}