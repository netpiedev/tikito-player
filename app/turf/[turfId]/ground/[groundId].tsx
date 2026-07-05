import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FullScreenLoader } from '@/src/components/FullScreenLoader';
import { useAvailableSlotsQuery } from '@/src/hooks/use-auth';
import type { AvailableSlot } from '@/src/lib/api';

function formatTime(value: string) {
  return value.slice(0, 5);
}

function formatDayLabel(dayOfWeek: string) {
  return dayOfWeek.slice(0, 3).toUpperCase();
}

function formatDateNumber(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
  });
}

function formatMonthLabel(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  return parsedDate
    .toLocaleDateString('en-IN', {
      month: 'short',
    })
    .toUpperCase();
}

export default function GroundSlotsScreen() {
  const params = useLocalSearchParams<{
    turfId?: string;
    groundId?: string;
    groundName?: string;
    turfName?: string;
  }>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const slotsQuery = useAvailableSlotsQuery(
    typeof params.groundId === 'string' ? params.groundId : undefined,
    true,
  );

  const groupedSlots = useMemo(() => {
    const groups = new Map<string, AvailableSlot[]>();

    for (const slot of slotsQuery.data ?? []) {
      const existing = groups.get(slot.date) ?? [];
      existing.push(slot);
      groups.set(slot.date, existing);
    }

    return Array.from(groups.entries()).map(([date, slots]) => ({
      date,
      dayOfWeek: slots[0]?.day_of_week ?? '',
      slots,
    }));
  }, [slotsQuery.data]);

  const activeDate = selectedDate ?? groupedSlots[0]?.date ?? null;
  const activeSlots =
    groupedSlots.find((group) => group.date === activeDate)?.slots ?? [];
  const basePriceSlot = useMemo(
    () => (slotsQuery.data ?? []).find((slot) => !slot.is_peak) ?? null,
    [slotsQuery.data],
  );
  const selectedSlots = useMemo(
    () =>
      (slotsQuery.data ?? []).filter((slot) =>
        selectedSlotIds.includes(slot.slot_id),
      ),
    [selectedSlotIds, slotsQuery.data],
  );

  const toggleSlot = (slotId: string) => {
    setSelectedSlotIds((current) =>
      current.includes(slotId)
        ? current.filter((currentSlotId) => currentSlotId !== slotId)
        : [...current, slotId],
    );
  };

  if (slotsQuery.isLoading) {
    return <FullScreenLoader label="Loading slots..." />;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-surface-bg"
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-28 pt-3"
        showsVerticalScrollIndicator={false}
      >
        {slotsQuery.isError ? (
          <View className="rounded-[24px] bg-surface-card px-5 py-5">
            <Text className="text-base font-semibold text-gold">
              {slotsQuery.error instanceof Error
                ? slotsQuery.error.message
                : 'Could not load available slots.'}
            </Text>
          </View>
        ) : groupedSlots.length ? (
          <View className="gap-4">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-[26px] font-black tracking-tight text-gold">
                {typeof params.groundName === 'string'
                  ? params.groundName
                  : 'Select Slot'}
              </Text>
              {basePriceSlot ? (
                <View className="rounded-xl bg-gold-light/20 px-3 py-2">
                  <Text className="text-xl font-black tracking-tight text-gold">
                    ₹ {basePriceSlot.price}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text className="px-1 text-sm font-semibold text-ink-secondary">
              Choose your preferred date
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="pr-4"
            >
              {groupedSlots.map((group) => {
                const isActive = activeDate === group.date;

                return (
                  <Pressable
                    className={`mr-3 h-[88px] w-[70px] items-center justify-center rounded-2xl border ${
                      isActive
                        ? 'border-gold bg-gold'
                        : 'border-surface-border bg-surface-card'
                    }`}
                    key={group.date}
                    onPress={() => setSelectedDate(group.date)}
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    <Text
                      className={`text-[11px] font-bold tracking-[1px] ${
                        isActive ? 'text-white/90' : 'text-ink-secondary'
                      }`}
                    >
                      {formatDayLabel(group.dayOfWeek)}
                    </Text>
                    <Text
                      className={`mt-2 text-[24px] font-black ${
                        isActive ? 'text-white' : 'text-ink-primary'
                      }`}
                    >
                      {formatDateNumber(group.date)}
                    </Text>
                    <Text
                      className={`mt-1 text-[11px] font-semibold tracking-[1px] ${
                        isActive ? 'text-white/80' : 'text-ink-secondary'
                      }`}
                    >
                      {formatMonthLabel(group.date)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text className="px-1 text-sm font-semibold text-ink-secondary">
              Choose your preferred timings
            </Text>
            <View className="-mx-1.5 flex-row flex-wrap">
              {activeSlots.map((slot) => {
                const isSelected = selectedSlotIds.includes(slot.slot_id);

                return (
                  <View className="mb-3 w-1/2 px-1.5" key={slot.slot_id}>
                    <Pressable
                      className={`rounded-xl border px-3 py-3 ${
                        isSelected
                          ? 'border-gold bg-gold/15'
                          : 'border-surface-border bg-surface-card'
                      }`}
                      onPress={() => toggleSlot(slot.slot_id)}
                      style={({ pressed }) => ({
                        transform: [{ scale: pressed ? 0.99 : 1 }],
                        opacity: pressed ? 0.96 : 1,
                      })}
                    >
                      <View className="gap-2">
                        {slot.is_peak ? (
                          <View className="self-start rounded-full bg-gold-light/20 px-2.5 py-1">
                            <Text className="text-[10px] font-bold uppercase tracking-[0.6px] text-gold">
                              Peak
                            </Text>
                          </View>
                        ) : null}

                        <Text className="text-[15px] font-black tracking-tight text-gold">
                          {formatTime(slot.start_time)} -{' '}
                          {formatTime(slot.end_time)}
                        </Text>
                        {slot.is_peak ? (
                          <Text className="text-sm font-semibold text-gold">
                            ₹ {slot.price}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View className="rounded-[24px] border border-gold/25 bg-gold/10 px-5 py-6">
            <Text className="text-base font-semibold text-gold">
              No slots available for this ground.
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="border-t border-surface-border bg-surface-card px-5 pb-6 pt-4">
        <Pressable
          accessibilityRole="button"
          className={`min-h-[56px] flex-row items-center justify-between rounded-2xl px-5 ${
            selectedSlots.length ? 'bg-gold-light/90' : 'bg-surface-elevated'
          }`}
          disabled={!selectedSlots.length}
          onPress={async () => {
            if (!selectedSlots.length) return;
            
            // Generate a unique key for this booking session
            const bookingSessionKey = `booking_slots_${Date.now()}`;
            
            // Save slots to AsyncStorage to avoid URL length limitations
            await AsyncStorage.setItem(bookingSessionKey, JSON.stringify({
              slots: selectedSlots,
              timestamp: Date.now()
            }));
            
            router.push({
              pathname: '/turf/[turfId]/ground/[groundId]/book',
              params: {
                turfId: typeof params.turfId === 'string' ? params.turfId : '',
                groundId:
                  typeof params.groundId === 'string' ? params.groundId : '',
                turfName:
                  typeof params.turfName === 'string' ? params.turfName : '',
                groundName:
                  typeof params.groundName === 'string'
                    ? params.groundName
                    : '',
                bookingSessionKey,
              },
            });
          }}
          style={({ pressed }) => ({
            transform: [{ scale: pressed && selectedSlots.length ? 0.99 : 1 }],
            opacity: selectedSlots.length ? (pressed ? 0.96 : 1) : 1,
          })}
        >
          <View>
            <Text
              className={`text-base font-black tracking-tight ${
                selectedSlots.length ? 'text-pitch-dim' : 'text-ink-secondary'
              }`}
            >
              Continue
            </Text>
            <Text
              className={`text-xs font-semibold ${
                selectedSlots.length ? 'text-pitch-dim' : 'text-ink-secondary'
              }`}
            >
              {selectedSlots.length
                ? `${selectedSlots.length} slot${
                    selectedSlots.length === 1 ? '' : 's'
                  } selected`
                : 'Select at least one slot'}
            </Text>
          </View>

          <View
            className={`h-9 w-9 items-center justify-center rounded-full ${
              selectedSlots.length ? 'bg-gold/20' : 'bg-surface-elevated'
            }`}
          >
            <Text
              className={`text-lg font-black ${
                selectedSlots.length ? 'text-gold' : 'text-ink-secondary'
              }`}
            >
              →
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
