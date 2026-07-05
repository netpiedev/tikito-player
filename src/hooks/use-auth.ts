import { useMutation, useQuery } from '@tanstack/react-query';

import {
  type AvailableSlot,
  bookSlot,
  type Booking,
  type BookSlotPayload,
  type BookSlotResponse,
  createPaymentOrder,
  type CreateOrderPayload,
  fetchCurrentUser,
  fetchAvailableSlots,
  fetchGroundDetails,
  fetchMyBookings,
  fetchNearbyTurfs,
  fetchTurfs,
  forgotPassword,
  type ForgotPasswordPayload,
  type Ground,
  type LoginPayload,
  loginUser,
  logoutUser,
  type NearbyTurf,
  resetPassword,
  type ResetPasswordPayload,
  type SignupPayload,
  signupUser,
  verifyOtp,
  verifyPayment,
  type VerifyOtpPayload,
  type VerifyPaymentPayload,
} from '@/src/lib/api';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: (payload: SignupPayload) => signupUser(payload),
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logoutUser,
  });
}

export function useCurrentUserQuery(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    enabled,
    retry: 1,
  });
}

export function useTurfsQuery(city?: string, enabled = true) {
  return useQuery({
    queryKey: ['turfs', city ?? 'all'],
    queryFn: () => fetchTurfs(city),
    enabled,
    retry: 1,
  });
}

export function useNearbyTurfsQuery(lat?: number, lng?: number, enabled = true) {
  return useQuery<NearbyTurf[]>({
    queryKey: ['nearby-turfs', lat, lng],
    queryFn: () => fetchNearbyTurfs(lat as number, lng as number),
    enabled: enabled && lat !== undefined && lng !== undefined,
    retry: 1,
  });
}

export function useGroundDetailsQuery(turfId?: string, enabled = true) {
  return useQuery<Ground[]>({
    queryKey: ['ground-details', turfId],
    queryFn: () => fetchGroundDetails(turfId as string),
    enabled: enabled && Boolean(turfId),
    retry: 1,
  });
}

export function useAvailableSlotsQuery(turfGroundId?: string, enabled = true) {
  return useQuery<AvailableSlot[]>({
    queryKey: ['available-slots', turfGroundId],
    queryFn: () => fetchAvailableSlots(turfGroundId as string),
    enabled: enabled && Boolean(turfGroundId),
    retry: 1,
  });
}

export function useBookSlotMutation() {
  return useMutation<BookSlotResponse, Error, BookSlotPayload>({
    mutationFn: (payload: BookSlotPayload) => bookSlot(payload),
  });
}

export function useMyBookingsQuery(enabled = true) {
  return useQuery<Booking[]>({
    queryKey: ['my-bookings'],
    queryFn: fetchMyBookings,
    enabled,
    retry: 1,
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
  });
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtp(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  });
}

export function useCreatePaymentOrderMutation() {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createPaymentOrder(payload),
  });
}

export function useVerifyPaymentMutation() {
  return useMutation({
    mutationFn: (payload: VerifyPaymentPayload) => verifyPayment(payload),
  });
}
