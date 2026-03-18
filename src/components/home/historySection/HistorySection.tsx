"use client";

import { useTranslations } from "next-intl";
import TimelineSection from "@/components/ui/timeline/TimelineSection";
import { TimelineItem } from "@/types/types";

export default function HistorySection() {
  const t = useTranslations("History");
  const items = t.raw("items") as TimelineItem[];

  return (
    <TimelineSection
      id="history"
      kicker={t("kicker")}
      title={t("title")}
      lead={t("lead")}
      items={items}
    />
  );
}
