"use client";

import styles from "./AboutSection.module.scss";
import { useTranslations } from "next-intl";
import * as React from "react";
import CustomCarousel, { CarouselImage } from "@/components/ui/custom-carusel/CustomCarusel";

export default function AboutSection() {
  const t = useTranslations("About");
  const [active, setActive] = React.useState(0);
  const [isPaused] = React.useState(false);

  const slides: CarouselImage[] = [
    {
      src: "/images/about/about1.jpeg",
      alt: t("slides.0.alt"),
      captionTitle: t("slides.0.title"),
      captionText: t("slides.0.caption"),
    },
    {
      src: "/images/about/about2.jpeg",
      alt: t("slides.1.alt"),
      captionTitle: t("slides.1.title"),
      captionText: t("slides.1.caption"),
    },
    {
      src: "/images/about/about3.jpeg",
      alt: t("slides.2.alt"),
      captionTitle: t("slides.2.title"),
      captionText: t("slides.2.caption"),
    },
  ];

  const count = slides.length;

  const go = React.useCallback(
    (i: number) => setActive((i + count) % count),
    [count],
  );
  React.useEffect(() => {
    if (isPaused || count <= 1) return;
    const id = window.setInterval(() => go(active + 1), 6500);
    return () => window.clearInterval(id);
  }, [isPaused, count, go, active]);

  return (
    <section className={styles.about} id="about">
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <div className={styles.overline}>{t("kicker")}</div>
            <h2 className={styles.title}>{t("title")}</h2>

            {/* ↓ Due paragrafi separati invece di uno solo lungo */}
            <p className={styles.lead}>{t("lead1")}</p>
            <p className={styles.lead}>{t("lead2")}</p>

            <ul className={styles.points}>
              <li>{t("points.0")}</li>
              <li>{t("points.1")}</li>
              <li>{t("points.2")}</li>
            </ul>
          </div>

          <div className={styles.carousel}>
            <div className={styles.card}>
              <CustomCarousel
                images={slides}
                captionVariant="overlay"
                fit="cover"
                sizes="(max-width: 900px) 92vw, 520px"
                labels={{
                  prev: t("prev"),
                  next: t("next"),
                  carouselLabel: t("carouselLabel"),
                  dotsLabel: t("dotsLabel"),
                  swipeHint: t("swipeHint"),
                  goTo: (index) => t("goTo", { index }),
                }}
              />
            </div>

            <div className={styles.since}>{t("badge")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
