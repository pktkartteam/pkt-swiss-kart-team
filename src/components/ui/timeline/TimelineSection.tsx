"use client";

import * as React from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import FlagIcon from "@mui/icons-material/Flag";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import styles from "./TimelineSection.module.scss";
import { TimelineItem } from "@/types/types";

function ItemIcon({ icon }: { icon?: TimelineItem["icon"] }) {
  const sx = { fontSize: 16, color: "rgba(10,12,16,0.9)" };
  switch (icon) {
    case "trophy":     return <EmojiEventsIcon sx={sx} />;
    case "graduation": return <SchoolIcon sx={sx} />;
    case "star":       return <StarIcon sx={sx} />;
    case "rocket":     return <RocketLaunchIcon sx={sx} />;
    case "flag":
    default:           return <FlagIcon sx={sx} />;
  }
}

function TimelineCard({ item, index }: { item: TimelineItem; index: number }) {
  const { ref, inView } = useInView({ threshold: 0.12, triggerOnce: true });
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`${styles.row} ${isEven ? styles.rowLeft : styles.rowRight} ${
        inView ? styles.rowVisible : ""
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className={styles.cardCol}>
        <div className={styles.card}>
          {item.image && (
            <div className={styles.imageWrap}>
              <Image
                src={item.image}
                alt={item.imageAlt ?? ""}
                fill
                sizes="(max-width: 600px) 92vw, (max-width: 900px) 45vw, 420px"
                style={{ objectFit: "cover", objectPosition: "center" }}
                loading="lazy"
                quality={80}
              />
              <div className={styles.imageOverlay} aria-hidden />
            </div>
          )}
          <div className={styles.cardBody}>
            <p className={styles.cardTitle}>{item.title}</p>
            <p className={styles.cardDesc}>{item.desc}</p>
          </div>
        </div>
      </div>

      <div className={styles.spine}>
        <div className={styles.dot}>
          <ItemIcon icon={item.icon} />
        </div>
      </div>

      <div className={styles.yearCol}>
        <span className={styles.year}>{item.year}</span>
      </div>
    </div>
  );
}

type Props = {
  kicker: string;
  title: string;
  lead: string;
  items: TimelineItem[];
  id?: string;
};

export default function TimelineSection({ kicker, title, lead, items, id }: Props) {
  return (
    <section className={styles.section} id={id}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.kicker}>{kicker}</p>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.lead}>{lead}</p>
        </div>

        <div className={styles.timeline}>
          <div className={styles.line} aria-hidden />
          {items.map((item, i) => (
            <TimelineCard key={`${item.year}-${i}`} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
