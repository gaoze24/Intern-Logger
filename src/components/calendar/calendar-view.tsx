"use client";

import { useMemo, useState } from "react";
import { isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: "deadline" | "interview" | "task" | "reminder";
};

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedEvents = useMemo(
    () => events.filter((event) => (date ? isSameDay(event.date, date) : false)),
    [events, date],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
      <Card>
        <CardContent className="p-2">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {selectedEvents.map((event) => (
            <div key={event.id} className="rounded-md border p-2 text-sm">
              <p className="font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.type} · {formatDate(event.date)}</p>
            </div>
          ))}
          {selectedEvents.length === 0 ? <p className="text-sm text-muted-foreground">No events for selected day.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
