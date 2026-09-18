export type BookingSlot = {
  dateLabel: string;
  time: string;
};

export type BookingCandidate = BookingSlot & {
  attendee: {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
  };
};

export function generateBookingCandidates(
  slots: BookingSlot[],
  account: { firstName: string; lastName: string; email: string; message: string },
  requiredCount = 40,
): BookingCandidate[] {
  const unique = [...new Map(slots.map((slot) => [`${slot.dateLabel}::${slot.time}`, slot])).values()];

  if (unique.length < requiredCount) {
    throw new Error(
      `Only ${unique.length} unique Calendly booking slots were discovered. At least ${requiredCount} are required.`,
    );
  }

  return unique.slice(0, requiredCount).map((slot, index) => ({
    ...slot,
    attendee: {
      firstName: account.firstName,
      lastName: `${account.lastName} ${index + 1}`,
      email: uniqueEmail(account.email, index + 1),
      message: `${account.message} #${index + 1}`,
    },
  }));
}

function uniqueEmail(baseEmail: string, index: number): string {
  const [localPart, domain] = baseEmail.split('@');

  if (!localPart || !domain) {
    throw new Error('CALENDLY_TEST_EMAIL must be a valid base email address.');
  }

  return `${localPart}+slot-${index}@${domain}`;
}
