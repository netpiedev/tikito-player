import { AxiosError } from 'axios';

import { apiClient } from '@/src/lib/axios';

export type LoginPayload = {
  identifier: string;
  password: string;
  role: 'user';
};

export type SignupPayload = {
  full_name: string;
  phone_no: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
};

export type AuthUser = {
  user_id: string;
  full_name: string;
  phone_no: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
};

export type Turf = {
  turf_field_id: string;
  turf_name: string;
  turf_location: string | null;
  turf_address: string | null;
  no_of_grounds: number | null;
  turf_facilities: string | null;
  turf_rules: string | null;
  turf_images: string | string[] | null;
  longitude: string | null;
  latitude: string | null;
};

export type GroundSlot = {
  slot_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  price: string;
  is_peak: boolean;
};

export type Ground = {
  turf_ground_id: string;
  ground_name: string;
  ground_loc: string | null;
  ground_type: string | null;
  turf_field_id: string;
  created_at: string;
  updated_at: string;
  ground_images: string[] | null;
  is_active: boolean | null;
  slots: GroundSlot[];
};

export type AvailableSlot = {
  slot_id: string;
  date: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  price: number;
  is_peak: boolean;
};

export type BookSlotPayload = {
  slot_ids: string[];
};

export type BookSlotResponse = {
  booking_ids: string[];
  message: string;
  total_slots: number;
};

export type Booking = {
  booking_id: string;
  booking_date: string;
  booking_status: string;
  payment_status: string;
  is_available: boolean;
  booked_at: string;
  start_time: string;
  end_time: string;
  price: number;
  day_of_week: string;
  ground_name: string;
  ground_type: string | null;
  turf_name: string;
  turf_address: string | null;
};

type ApiErrorResponse = {
  error?: string;
  detail?: string;
  message?: string;
};

function extractApiErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.error ?? data?.detail ?? data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
}

export async function signupUser(payload: SignupPayload) {
  try {
    const { data } = await apiClient.post('/users/sign-up', payload);

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export async function loginUser(payload: LoginPayload) {
  try {
    const { data } = await apiClient.post<AuthResponse | ApiErrorResponse>('/auth/login', payload);

    if ('error' in data && data.error) {
      throw new Error(data.error);
    }

    if (!('access_token' in data) || !data.access_token) {
      throw new Error('Access token missing from login response.');
    }

    return data as AuthResponse;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export async function fetchCurrentUser() {
  try {
    const { data } = await apiClient.get<AuthUser>('/auth/me');
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export async function logoutUser() {
  try {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export async function deleteMyAccount() {
  try {
    const { data } = await apiClient.delete('/users/me');
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export async function fetchTurfs(city?: string) {
  try {
    const { data } = await apiClient.get<Turf[]>('/users/turfs', {
      params: city !== undefined ? { city } : undefined,
    });

    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export type NearbyTurf = {
  turf_field_id: string;
  turf_name: string;
  turf_address: string | null;
  turf_location: string | null;
  latitude: number;
  longitude: number;
  distance_km: number;
};

export async function fetchNearbyTurfs(lat: number, lng: number, radiusKm = 10) {
  try {
    const { data } = await apiClient.get<NearbyTurf[]>('/users/nearby-turfs', {
      params: { lat, lng, radius_km: radiusKm },
    });
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export async function fetchGroundDetails(turfId: string) {
  try {
    const { data } = await apiClient.get<Ground[]>('/users/ground-details', {
      params: { turf_id: turfId },
    });

    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export async function fetchAvailableSlots(turfGroundId: string) {
  try {
    const { data } = await apiClient.get<AvailableSlot[]>(
      `/users/available-slots/${turfGroundId}`,
    );

    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export async function bookSlot(payload: BookSlotPayload): Promise<BookSlotResponse> {
  try {
    const { data } = await apiClient.post<BookSlotResponse>('/users/book', payload);

    if ((data as any)?.error) {
      throw new Error((data as any).error);
    }

    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export async function fetchMyBookings() {
  try {
    const { data } = await apiClient.get<Booking[]>('/users/my-bookings');
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

// ─── Forgot Password ─────────────────────────────────────────────────────────

export type ForgotPasswordPayload = {
  email: string;
  role: 'user';
};

export type VerifyOtpPayload = {
  email: string;
  otp: string;
};

export type ResetPasswordPayload = {
  email: string;
  new_password: string;
};

export async function forgotPassword(payload: ForgotPasswordPayload) {
  try {
    const { data } = await apiClient.post('/auth/forgot-password', payload);
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  try {
    const { data } = await apiClient.post('/auth/verify-otp', payload);
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export async function resetPassword(payload: ResetPasswordPayload) {
  try {
    const { data } = await apiClient.post('/auth/reset-password', payload);
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type CreateOrderPayload = {
  booking_ids: string[];
  callback_url?: string;
};

export type CreateOrderResponse = {
  order_id: string;
  amount: number;
  currency: string;
  /** All booking IDs covered by this consolidated order */
  booking_ids: string[];
  key: string;
  callback_url?: string;
};

export type VerifyPaymentPayload = {
  /** All booking IDs that belong to the order */
  booking_ids: string[];
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function createPaymentOrder(payload: CreateOrderPayload) {
  try {
    const { data } = await apiClient.post<CreateOrderResponse>(
      '/users/payment/create-order',
      payload,
    );
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

export async function verifyPayment(payload: VerifyPaymentPayload) {
  try {
    const { data } = await apiClient.post('/users/payment/verify', payload);
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}
