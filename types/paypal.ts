export interface CartItem {
  id: string;
  quantity: string;
}

export interface CreateOrderRequest {
  cart: CartItem[];
}

export interface PayPalErrorDetail {
  issue: string;
  description: string;
}

export interface PayPalOrderResponse {
  id?: string;
  details?: PayPalErrorDetail[];
  debug_id?: string;
  purchase_units?: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
      }>;
    };
  }>;
}

export interface CreateOrderResponse {
  jsonResponse: PayPalOrderResponse;
  httpStatusCode: number;
}