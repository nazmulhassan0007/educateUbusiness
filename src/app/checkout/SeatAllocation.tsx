"use client";

import { cn } from "@/lib/utils";
import type { CartItem } from "@/store/cart-store";
import { ERROR_TEXT, FIELD, FIELD_ERROR, PANEL_TITLE } from "./checkout-ui";
import type { AllocationState, SeatEntry } from "./seat-allocation";

export default function SeatAllocation({
  items,
  allocations,
  onUpdateSeat,
}: {
  items: CartItem[];
  allocations: AllocationState;
  onUpdateSeat: (
    slug: string,
    seatIndex: number,
    field: keyof SeatEntry,
    value: string,
  ) => void;
}) {
  const groupItems = items.filter((item) => item.purchaseType === "group");

  if (groupItems.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h2 className={PANEL_TITLE}>Who&rsquo;s this for?</h2>
        <p className="m-0 type-small text-[#06180b]/70">
          Add each learner&rsquo;s details so we can set up their course
          access.
        </p>
      </div>

      {groupItems.map((item) => {
        const slug = item.course.slug;
        const seats = allocations[slug];
        if (!seats) return null;

        return (
          <div key={slug} className="flex flex-col gap-2">
            <h3 className="m-0 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 type-body font-medium">
              {item.course.title}
              <span className="type-small font-normal text-[#06180b]/65 tabular-nums">
                {item.quantity} seats
              </span>
            </h3>

            <ol className="m-0 list-none p-0">
              {seats.map((seat, index) => {
                const normalizedEmail = seat.email.trim().toLowerCase();
                const isDuplicate =
                  normalizedEmail.length > 0 &&
                  seats.some(
                    (other, otherIndex) =>
                      otherIndex !== index &&
                      other.email.trim().toLowerCase() === normalizedEmail,
                  );
                const seatLabel = `Seat ${index + 1}`;
                const errorId = `${slug}-seat-${index}-error`;

                return (
                  <li
                    key={index}
                    className="flex flex-col gap-2 border-t border-[#06180b]/12 py-4 sm:grid sm:grid-cols-[64px_minmax(0,1fr)] sm:items-start sm:gap-x-4"
                  >
                    <span className="type-caption font-medium text-[#06180b]/65 tabular-nums sm:pt-3.5">
                      {seatLabel}
                    </span>
                    <div className="flex flex-col gap-2">
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)]">
                        <input
                          type="text"
                          aria-label={`${seatLabel} first name`}
                          placeholder="First name"
                          autoComplete="off"
                          value={seat.firstName}
                          onChange={(e) =>
                            onUpdateSeat(slug, index, "firstName", e.target.value)
                          }
                          className={FIELD}
                        />
                        <input
                          type="text"
                          aria-label={`${seatLabel} last name`}
                          placeholder="Last name"
                          autoComplete="off"
                          value={seat.lastName}
                          onChange={(e) =>
                            onUpdateSeat(slug, index, "lastName", e.target.value)
                          }
                          className={FIELD}
                        />
                        <input
                          type="email"
                          aria-label={`${seatLabel} email`}
                          placeholder="Email"
                          autoComplete="off"
                          value={seat.email}
                          onChange={(e) =>
                            onUpdateSeat(slug, index, "email", e.target.value)
                          }
                          aria-invalid={isDuplicate}
                          aria-describedby={isDuplicate ? errorId : undefined}
                          className={cn(
                            FIELD,
                            "sm:col-span-2 xl:col-span-1",
                            isDuplicate && FIELD_ERROR,
                          )}
                        />
                      </div>
                      {isDuplicate && (
                        <p id={errorId} className={ERROR_TEXT}>
                          This email is already added for this course.
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
